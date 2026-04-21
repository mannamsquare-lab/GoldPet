package com.goldpet.domain.community.service

import com.goldpet.domain.common.service.FileAttachmentLookupService
import com.goldpet.domain.common.util.toHttps
import com.goldpet.domain.community.dto.CommunityCategoryResponse
import com.goldpet.domain.community.dto.CommunityCommentCreateRequest
import com.goldpet.domain.community.dto.CommunityCommentResponse
import com.goldpet.domain.community.dto.CommunityPostCreateRequest
import com.goldpet.domain.community.dto.CommunityPostResponse
import com.goldpet.domain.community.dto.CommunityPostUpdateRequest
import com.goldpet.domain.community.entity.CommunityComment
import com.goldpet.domain.community.entity.CommunityPost
import com.goldpet.domain.community.entity.CommunityPostLike
import com.goldpet.domain.community.entity.CommunityPostImage
import com.goldpet.domain.community.repository.CommunityCategoryRepository
import com.goldpet.domain.community.repository.CommunityCommentRepository
import com.goldpet.domain.community.repository.CommunityPostLikeRepository
import com.goldpet.domain.community.repository.CommunityPostRepository
import com.goldpet.domain.friend.repository.UserBlockRepository
import com.goldpet.domain.gamification.entity.BadgeConditionType
import com.goldpet.domain.gamification.service.BadgeAwardService
import com.goldpet.domain.user.entity.User
import com.goldpet.domain.user.repository.UserRepository
import com.goldpet.domain.common.exception.*
import org.slf4j.LoggerFactory
import org.springframework.cache.annotation.Cacheable
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class CommunityService(
    private val postRepository: CommunityPostRepository,
    private val categoryRepository: CommunityCategoryRepository,
    private val commentRepository: CommunityCommentRepository,
    private val likeRepository: CommunityPostLikeRepository,
    private val commentLikeRepository: com.goldpet.domain.community.repository.CommunityCommentLikeRepository,
    private val userRepository: UserRepository,
    private val fileRepository: com.goldpet.domain.common.repository.FileAttachmentRepository,
    private val systemSettingService: com.goldpet.domain.common.service.SystemSettingService,
    private val badgeAwardService: BadgeAwardService,
    private val userBlockRepository: UserBlockRepository,
    private val fileAttachmentLookupService: FileAttachmentLookupService
) {
    private val log = LoggerFactory.getLogger(CommunityService::class.java)

    // T1-1.3 helpers — 각 mapping 에서 author profile variant 를 간결하게 공급.
    private fun thumbOf(url: String?): String? = fileAttachmentLookupService.thumbnailUrlFor(url)
    private fun viewerOf(url: String?): String? = fileAttachmentLookupService.viewerUrlFor(url)

    // T1-2 Phase 5: post body 이미지 variant 4종을 한 번에 추출. post.images 는 이미
    // FileAttachment join 으로 로드되어 있으므로 variant 컬럼 직접 접근 (추가 쿼리 0).
    private data class PostImageUrls(
        val originals: List<String>,
        val thumbnails: List<String>,
        val mediums: List<String>,
        val viewers: List<String>,
    )

    private fun postImageUrls(post: CommunityPost): PostImageUrls {
        val sorted = post.images.sortedBy { it.sortOrder }
        return PostImageUrls(
            originals = sorted.map { it.file.url },
            thumbnails = sorted.map { it.file.thumbnailUrl ?: it.file.url },
            mediums = sorted.map { it.file.mediumUrl ?: it.file.url },
            viewers = sorted.map { it.file.viewerUrl ?: it.file.url },
        )
    }

    // 리스트 경로 전용: author 프로필 + post image 를 한 번의 IN 쿼리로 prefetch.
    private fun warmAuthorAndImages(posts: List<CommunityPost>) {
        val urls = posts.flatMap { post ->
            val u = post.user
            listOfNotNull(u.profileImageUrl.toHttps()) +
                post.images.map { it.file.url }
        }
        if (urls.isNotEmpty()) fileAttachmentLookupService.batchLookup(urls)
    }

    private fun warmCommentAuthors(comments: List<CommunityComment>) {
        val urls = comments.mapNotNull { it.user.profileImageUrl.toHttps() }
        if (urls.isNotEmpty()) fileAttachmentLookupService.batchLookup(urls)
    }
    // Assuming UserRepository needs to be injected or used to fetch currentUser
    fun getPosts(categoryId: Long?, pageable: Pageable, currentUserId: Long?): Page<CommunityPostResponse> {
        val blockedUserIds = currentUserId?.let { userBlockRepository.findBlockedUserIds(it) } ?: emptyList()

        val posts = if (categoryId != null) {
            val category = categoryRepository.findById(categoryId).orElseThrow { NotFoundException("Category not found") }
            if (blockedUserIds.isNotEmpty()) {
                postRepository.findAllByCategoryExcludingUsersAndIsHiddenFalse(category, blockedUserIds, pageable)
            } else {
                postRepository.findAllByCategoryAndIsHiddenFalse(category, pageable)
            }
        } else {
            if (blockedUserIds.isNotEmpty()) {
                postRepository.findAllExcludingUsersAndIsHiddenFalse(blockedUserIds, pageable)
            } else {
                postRepository.findAllByIsHiddenFalse(pageable)
            }
        }

        val currentUser = currentUserId?.let { userRepository.findById(it).orElse(null) }
        val previewLength = systemSettingService.getInt("COMMUNITY_POST_PREVIEW_LENGTH", 100)

        warmAuthorAndImages(posts.content) // T1-1.3 N+1 방지: author + image variant batch prefetch

        return posts.map { post ->
            val isLiked = currentUser?.let { likeRepository.existsByPostAndUser(post, it) } ?: false
            val isCommented = currentUserId?.let { commentRepository.existsByPostIdAndUserId(post.id, it) } ?: false
            val commentCount = commentRepository.countByPostId(post.id)
            
            val contentPreview = if (post.content.length > previewLength) {
                post.content.substring(0, previewLength) + "..."
            } else {
                post.content
            }

            val img = postImageUrls(post)
            CommunityPostResponse(
                id = post.id,
                authorId = post.user.id,
                authorNickname = post.user.nickname,
                authorProfileUrl = post.user.profileImageUrl.toHttps(),
                authorProfileUrlThumbnail = thumbOf(post.user.profileImageUrl.toHttps()),
                authorProfileUrlViewer = viewerOf(post.user.profileImageUrl.toHttps()),
                categoryId = post.category.id,
                categoryName = post.category.name,
                title = post.title,
                content = contentPreview,
                visibility = post.visibility,
                postType = post.postType,
                viewCount = post.viewCount,
                likeCount = post.likeCount,
                commentCount = commentCount,
                createdAt = post.createdAt,
                isLiked = isLiked,
                isCommentedByMe = isCommented,
                imageUrls = img.originals,
                imageUrlsThumbnail = img.thumbnails,
                imageUrlsMedium = img.mediums,
                imageUrlsViewer = img.viewers,
                isMine = currentUser?.id == post.user.id
            )
        }
    }

    @Cacheable("community:categories")
    fun getCategories(): List<CommunityCategoryResponse> {
        log.debug("getCategories called (Cache Miss if seeing this)")
        return getCachedCategoryEntities().map { category ->
            val count = postRepository.countByCategoryAndIsHiddenFalse(category)
            log.debug("Category {} count: {}", category.name, count)
            CommunityCategoryResponse(
                id = category.id,
                name = category.name,
                code = category.code,
                postCount = count
            )
        }
    }

    @Cacheable("community:categories:entities")
    fun getCachedCategoryEntities(): List<com.goldpet.domain.community.entity.CommunityCategory> {
        return categoryRepository.findAll()
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = ["community:categories"], allEntries = true)
    fun createPost(userId: Long, request: CommunityPostCreateRequest): CommunityPostResponse {
        log.debug("createPost called for user {}, category {}", userId, request.categoryId)
        val user = userRepository.findById(userId).orElseThrow { NotFoundException("User not found") }
        val category = categoryRepository.findById(request.categoryId).orElseThrow { NotFoundException("Category not found") }

        val post = CommunityPost(
            user = user,
            category = category,
            title = request.title,
            content = request.content,
            visibility = request.visibility,
            postType = request.postType
        )

        if (request.imageUrls.isNotEmpty()) {
            val files = fileRepository.findAllByUrlIn(request.imageUrls)
            val fileMap = files.associateBy { it.url }
            
            request.imageUrls.forEachIndexed { index, url ->
                fileMap[url]?.let { file ->
                    post.images.add(CommunityPostImage(post = post, file = file, sortOrder = index))
                }
            }
        }
        
        val savedPost = postRepository.save(post)

        try {
            badgeAwardService.checkAndAwardBadges(userId, BadgeConditionType.COMMUNITY_POST)
        } catch (e: Exception) {
            log.warn("Badge check failed for userId={}", userId, e)
        }

        val img = postImageUrls(savedPost)
        return CommunityPostResponse(
            id = savedPost.id,
            authorId = user.id,
            authorNickname = user.nickname,
            authorProfileUrl = user.profileImageUrl.toHttps(),
            authorProfileUrlThumbnail = thumbOf(user.profileImageUrl.toHttps()),
            authorProfileUrlViewer = viewerOf(user.profileImageUrl.toHttps()),
            categoryId = category.id,
            categoryName = category.name,
            title = savedPost.title,
            content = savedPost.content,
            visibility = savedPost.visibility,
            postType = savedPost.postType,
            viewCount = savedPost.viewCount,
            likeCount = savedPost.likeCount,
            commentCount = 0,
            createdAt = savedPost.createdAt,
            imageUrls = img.originals,
            imageUrlsThumbnail = img.thumbnails,
            imageUrlsMedium = img.mediums,
            imageUrlsViewer = img.viewers,
            isMine = true
        )
    }

    @Transactional
    fun toggleLike(userId: Long, postId: Long): Boolean {
        val user = userRepository.findById(userId).orElseThrow { NotFoundException("User not found") }
        val post = postRepository.findById(postId).orElseThrow { NotFoundException("Post not found") }
        if (post.isHidden) throw NotFoundException("Post not found")

        val existingLike = likeRepository.findByPostAndUser(post, user)
        return if (existingLike != null) {
            likeRepository.delete(existingLike)
            post.likeCount = (post.likeCount - 1).coerceAtLeast(0)
            false
        } else {
            likeRepository.save(CommunityPostLike(post = post, user = user))
            post.likeCount += 1
            true
        }
    }

    @Transactional
    fun createComment(userId: Long, postId: Long, request: CommunityCommentCreateRequest): CommunityCommentResponse {
        val user = userRepository.findById(userId).orElseThrow { NotFoundException("User not found") }
        val post = postRepository.findById(postId).orElseThrow { NotFoundException("Post not found") }
        if (post.isHidden) throw NotFoundException("Post not found")

        val parentComment = request.parentCommentId?.let {
            commentRepository.findById(it).orElseThrow { NotFoundException("Parent comment not found") }
        }

        val comment = CommunityComment(
            post = post,
            user = user,
            parentComment = parentComment,
            content = request.content
        )
        
        val savedComment = commentRepository.save(comment)

        try {
            badgeAwardService.checkAndAwardBadges(userId, BadgeConditionType.COMMUNITY_COMMENT)
        } catch (e: Exception) {
            log.warn("Badge check failed for userId={}", userId, e)
        }

        return CommunityCommentResponse(
            id = savedComment.id,
            postId = post.id,
            authorId = user.id,
            authorNickname = user.nickname,
            authorProfileUrl = user.profileImageUrl.toHttps(),
            authorProfileUrlThumbnail = thumbOf(user.profileImageUrl.toHttps()),
            authorProfileUrlViewer = viewerOf(user.profileImageUrl.toHttps()),
            content = savedComment.content,
            createdAt = savedComment.createdAt,
            parentCommentId = parentComment?.id,
            isMine = true
        )
    }

    @Transactional
    fun toggleCommentLike(userId: Long, commentId: Long): Boolean {
        val user = userRepository.findById(userId).orElseThrow { NotFoundException("User not found") }
        val comment = commentRepository.findById(commentId).orElseThrow { NotFoundException("Comment not found") }
        if (comment.isHidden) throw NotFoundException("Comment not found")

        val existingLike = commentLikeRepository.findByCommentAndUser(comment, user)
        return if (existingLike != null) {
            commentLikeRepository.delete(existingLike)
            comment.likeCount = (comment.likeCount - 1).coerceAtLeast(0)
            false
        } else {
            commentLikeRepository.save(com.goldpet.domain.community.entity.CommunityCommentLike(comment = comment, user = user))
            comment.likeCount += 1
            true
        }
    }

    @Transactional
    fun getPostDetail(postId: Long, currentUserId: Long?): CommunityPostResponse {
        val post = postRepository.findById(postId).orElseThrow { NotFoundException("Post not found") }
        if (post.isHidden) throw NotFoundException("Post not found")

        // Increment view count
        post.viewCount += 1
        postRepository.save(post)

        val isLiked = currentUserId?.let { userId ->
            val user = userRepository.findById(userId).orElse(null)
            user?.let { likeRepository.existsByPostAndUser(post, it) } ?: false
        } ?: false

        val isCommented = currentUserId?.let { userId ->
            commentRepository.existsByPostIdAndUserId(postId, userId)
        } ?: false

        val commentCount = commentRepository.countByPostId(postId)

        // Fetch all non-hidden comments, filter blocked users, and sort recursively
        val blockedIds = currentUserId?.let { userBlockRepository.findBlockedUserIds(it) }?.toSet() ?: emptySet()
        val allComments = commentRepository.findByPostIdAndIsHiddenFalseOrderByCreatedAtAsc(postId)
            .filter { it.user.id !in blockedIds }

        // T1-1.3 batch prefetch: post author + post images + comment authors 를 한 번의 IN 쿼리로.
        warmAuthorAndImages(listOf(post))
        warmCommentAuthors(allComments)

        val commentMap = allComments.groupBy { it.parentComment?.id }
        val sortedComments = mutableListOf<CommunityCommentResponse>()

        fun traverse(parentId: Long?, depth: Int) {
            val children = commentMap[parentId] ?: return
            children.forEach { comment ->
                val isCommentLiked = currentUserId?.let { userId ->
                    val user = userRepository.findById(userId).orElse(null)
                    user?.let { commentLikeRepository.existsByCommentAndUser(comment, it) } ?: false
                } ?: false

                val isReplied = currentUserId?.let { userId ->
                    commentRepository.existsByParentCommentIdAndUserId(comment.id, userId)
                } ?: false
                
                // Calculate logic depth. If parent is null, depth is 1.
                // The recursion passes depth + 1. 
                // We clamp visual depth to 3 if needed, but data depth should be accurate?
                // User said "can do 3 depth".
                
                sortedComments.add(
                    CommunityCommentResponse(
                        id = comment.id,
                        postId = post.id,
                        authorId = comment.user.id,
                        authorNickname = comment.user.nickname,
                        authorProfileUrl = comment.user.profileImageUrl.toHttps(),
                        authorProfileUrlThumbnail = thumbOf(comment.user.profileImageUrl.toHttps()),
                        authorProfileUrlViewer = viewerOf(comment.user.profileImageUrl.toHttps()),
                        content = comment.content,
                        createdAt = comment.createdAt,
                        parentCommentId = comment.parentComment?.id,
                        likeCount = comment.likeCount,
                        isLiked = isCommentLiked,
                        isRepliedByMe = isReplied,
                        depth = depth,
                        replyCount = commentMap[comment.id]?.size ?: 0,
                        isMine = currentUserId == comment.user.id
                    )
                )
                
                // Recurse for children
                traverse(comment.id, depth + 1)
            }
        }

        // Start traversal from root comments (parentId = null)
        traverse(null, 1)        
        
        val comments = sortedComments

        val img = postImageUrls(post)
        return CommunityPostResponse(
            id = post.id,
            authorId = post.user.id,
            authorNickname = post.user.nickname,
            authorProfileUrl = post.user.profileImageUrl.toHttps(),
                authorProfileUrlThumbnail = thumbOf(post.user.profileImageUrl.toHttps()),
                authorProfileUrlViewer = viewerOf(post.user.profileImageUrl.toHttps()),
            categoryId = post.category.id,
            categoryName = post.category.name,
            title = post.title,
            content = post.content,
            visibility = post.visibility,
            postType = post.postType,
            viewCount = post.viewCount,
            likeCount = post.likeCount,
            commentCount = commentCount,
            createdAt = post.createdAt,
            isLiked = isLiked,
            isCommentedByMe = isCommented,
            imageUrls = img.originals,
            imageUrlsThumbnail = img.thumbnails,
            imageUrlsMedium = img.mediums,
            imageUrlsViewer = img.viewers,
            comments = comments,
            isMine = currentUserId == post.user.id
        )
    }

    fun getComments(postId: Long, pageable: Pageable): Page<CommunityCommentResponse> {
        val post = postRepository.findById(postId).orElseThrow { NotFoundException("Post not found") }
        if (post.isHidden) throw NotFoundException("Post not found")
        val comments = commentRepository.findAllByPostAndIsHiddenFalse(post, pageable)
        warmCommentAuthors(comments.content) // T1-1.3 batch prefetch
        return comments.map { comment ->
            CommunityCommentResponse(
                id = comment.id,
                postId = post.id,
                authorId = comment.user.id,
                authorNickname = comment.user.nickname,
                authorProfileUrl = comment.user.profileImageUrl.toHttps(),
                        authorProfileUrlThumbnail = thumbOf(comment.user.profileImageUrl.toHttps()),
                        authorProfileUrlViewer = viewerOf(comment.user.profileImageUrl.toHttps()),
                content = comment.content,
                createdAt = comment.createdAt,
                parentCommentId = comment.parentComment?.id
            )
        }
    }

    @Transactional
    fun updatePost(postId: Long, userId: Long, request: CommunityPostUpdateRequest): CommunityPostResponse {
        val post = postRepository.findById(postId).orElseThrow { NotFoundException("Post not found") }
        if (post.isHidden) throw NotFoundException("Post not found")

        if (post.user.id != userId) {
            throw ForbiddenException("Not authorized to update this post")
        }

        request.title?.let { post.title = it }
        request.content?.let { post.content = it }
        request.visibility?.let { post.visibility = CommunityPost.Visibility.valueOf(it) }
        request.imageUrls?.let { urls ->
            post.images.clear()
            if (urls.isNotEmpty()) {
                val files = fileRepository.findAllByUrlIn(urls)
                val fileMap = files.associateBy { it.url }

                urls.forEachIndexed { index, url ->
                    fileMap[url]?.let { file ->
                        post.images.add(CommunityPostImage(post = post, file = file, sortOrder = index))
                    }
                }
            }
        }

        val savedPost = postRepository.save(post)

        return CommunityPostResponse(
            id = savedPost.id,
            authorId = savedPost.user.id,
            authorNickname = savedPost.user.nickname,
            authorProfileUrl = savedPost.user.profileImageUrl.toHttps(),
            authorProfileUrlThumbnail = thumbOf(savedPost.user.profileImageUrl.toHttps()),
            authorProfileUrlViewer = viewerOf(savedPost.user.profileImageUrl.toHttps()),
            categoryId = savedPost.category.id,
            categoryName = savedPost.category.name,
            title = savedPost.title,
            content = savedPost.content,
            visibility = savedPost.visibility,
            postType = savedPost.postType,
            viewCount = savedPost.viewCount,
            likeCount = savedPost.likeCount,
            commentCount = 0,
            createdAt = savedPost.createdAt,
            isMine = true
        )
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = ["community:categories"], allEntries = true)
    fun deletePost(postId: Long, userId: Long) {
        val post = postRepository.findById(postId).orElseThrow { NotFoundException("Post not found") }
        if (post.isHidden) throw NotFoundException("Post not found")

        if (post.user.id != userId) {
            throw ForbiddenException("Not authorized to delete this post")
        }

        postRepository.delete(post)
    }

    fun getMyPosts(userId: Long, pageable: Pageable): Page<CommunityPostResponse> {
        val posts = postRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
        val previewLength = systemSettingService.getInt("COMMUNITY_POST_PREVIEW_LENGTH", 100)

        warmAuthorAndImages(posts.content) // T1-1.3 batch prefetch

        return posts.map { post ->
            val commentCount = commentRepository.countByPostId(post.id)
            val contentPreview = if (post.content.length > previewLength) {
                post.content.substring(0, previewLength) + "..."
            } else {
                post.content
            }

            val img = postImageUrls(post)
            CommunityPostResponse(
                id = post.id,
                authorId = post.user.id,
                authorNickname = post.user.nickname,
                authorProfileUrl = post.user.profileImageUrl.toHttps(),
                authorProfileUrlThumbnail = thumbOf(post.user.profileImageUrl.toHttps()),
                authorProfileUrlViewer = viewerOf(post.user.profileImageUrl.toHttps()),
                categoryId = post.category.id,
                categoryName = post.category.name,
                title = post.title,
                content = contentPreview,
                visibility = post.visibility,
                postType = post.postType,
                viewCount = post.viewCount,
                likeCount = post.likeCount,
                commentCount = commentCount,
                createdAt = post.createdAt,
                imageUrls = img.originals,
                imageUrlsThumbnail = img.thumbnails,
                imageUrlsMedium = img.mediums,
                imageUrlsViewer = img.viewers,
                isMine = true
            )
        }
    }

    fun getMyComments(userId: Long, pageable: Pageable): Page<CommunityCommentResponse> {
        val comments = commentRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
        warmCommentAuthors(comments.content) // T1-1.3 batch prefetch

        return comments.map { comment ->
            CommunityCommentResponse(
                id = comment.id,
                postId = comment.post.id,
                authorId = comment.user.id,
                authorNickname = comment.user.nickname,
                authorProfileUrl = comment.user.profileImageUrl.toHttps(),
                        authorProfileUrlThumbnail = thumbOf(comment.user.profileImageUrl.toHttps()),
                        authorProfileUrlViewer = viewerOf(comment.user.profileImageUrl.toHttps()),
                content = comment.content,
                createdAt = comment.createdAt,
                parentCommentId = comment.parentComment?.id,
                likeCount = comment.likeCount,
                isMine = true,
                postTitle = comment.post.title
            )
        }
    }

    fun searchPosts(keyword: String, pageable: Pageable, currentUserId: Long?): Page<CommunityPostResponse> {
        val blockedUserIds = currentUserId?.let { userBlockRepository.findBlockedUserIds(it) } ?: emptyList()
        val posts = if (blockedUserIds.isNotEmpty()) {
            postRepository.searchByKeywordExcludingUsersAndIsHiddenFalse(keyword, blockedUserIds, pageable)
        } else {
            postRepository.searchByKeywordAndIsHiddenFalse(keyword, pageable)
        }
        val currentUser = currentUserId?.let { userRepository.findById(it).orElse(null) }

        warmAuthorAndImages(posts.content) // T1-1.3 batch prefetch

        return posts.map { post ->
            val isLiked = currentUser?.let { likeRepository.existsByPostAndUser(post, it) } ?: false
            CommunityPostResponse(
                id = post.id,
                authorId = post.user.id,
                authorNickname = post.user.nickname,
                authorProfileUrl = post.user.profileImageUrl.toHttps(),
                authorProfileUrlThumbnail = thumbOf(post.user.profileImageUrl.toHttps()),
                authorProfileUrlViewer = viewerOf(post.user.profileImageUrl.toHttps()),
                categoryId = post.category.id,
                categoryName = post.category.name,
                title = post.title,
                content = post.content,
                visibility = post.visibility,
                postType = post.postType,
                viewCount = post.viewCount,
                likeCount = post.likeCount,
                commentCount = 0,
                createdAt = post.createdAt,
                isLiked = isLiked,
                isMine = currentUser?.id == post.user.id
            )
        }
    }

    @Transactional
    fun updateComment(commentId: Long, userId: Long, content: String): CommunityCommentResponse {
        val comment = commentRepository.findById(commentId)
            .orElseThrow { NotFoundException("Comment not found") }

        if (comment.user.id != userId) {
            throw AccessDeniedException("Not authorized to update this comment")
        }

        comment.content = content
        val saved = commentRepository.save(comment)

        return CommunityCommentResponse(
            id = saved.id,
            postId = saved.post.id,
            authorId = saved.user.id,
            authorNickname = saved.user.nickname,
            authorProfileUrl = saved.user.profileImageUrl.toHttps(),
            authorProfileUrlThumbnail = thumbOf(saved.user.profileImageUrl.toHttps()),
            authorProfileUrlViewer = viewerOf(saved.user.profileImageUrl.toHttps()),
            content = saved.content,
            createdAt = saved.createdAt,
            parentCommentId = saved.parentComment?.id,
            likeCount = saved.likeCount,
            isMine = true
        )
    }

    @Transactional
    fun deleteComment(commentId: Long, userId: Long) {
        val comment = commentRepository.findById(commentId)
            .orElseThrow { NotFoundException("Comment not found") }

        if (comment.user.id != userId) {
            throw AccessDeniedException("Not authorized to delete this comment")
        }

        // Step 1: Nullify adopted_comment_id FK if this comment is adopted on any post
        val adoptingPost = postRepository.findByAdoptedComment(comment)
        if (adoptingPost != null) {
            adoptingPost.adoptedComment = null
            postRepository.save(adoptingPost)
        }

        // Step 2: Recursively collect all descendant comments (depth-first)
        val allDescendants = mutableListOf<CommunityComment>()
        fun collectDescendants(parent: CommunityComment) {
            val children = commentRepository.findAllByParentComment(parent)
            for (child in children) {
                collectDescendants(child) // recurse first (depth-first)
                allDescendants.add(child)
            }
        }
        collectDescendants(comment)

        // Step 3: Delete likes on all descendant comments (batch)
        if (allDescendants.isNotEmpty()) {
            commentLikeRepository.deleteAllByCommentIn(allDescendants)
        }

        // Step 4: Delete likes on the target comment itself
        commentLikeRepository.deleteAllByComment(comment)

        // Step 5: Delete descendant comments (they are in leaf-first order from depth-first traversal)
        for (descendant in allDescendants) {
            // Also nullify adopted_comment_id for descendants if any
            val descendantAdoptingPost = postRepository.findByAdoptedComment(descendant)
            if (descendantAdoptingPost != null) {
                descendantAdoptingPost.adoptedComment = null
                postRepository.save(descendantAdoptingPost)
            }
            commentRepository.delete(descendant)
        }

        // Step 6: Delete the target comment
        commentRepository.delete(comment)
    }
}
