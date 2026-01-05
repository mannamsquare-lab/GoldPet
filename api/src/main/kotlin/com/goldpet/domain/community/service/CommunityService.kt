package com.goldpet.domain.community.service

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
import com.goldpet.domain.user.entity.User
import com.goldpet.domain.user.repository.UserRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
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
    private val systemSettingService: com.goldpet.domain.common.service.SystemSettingService
) {
    // Assuming UserRepository needs to be injected or used to fetch currentUser
    fun getPosts(categoryId: Long?, pageable: Pageable, currentUserId: Long?): Page<CommunityPostResponse> {
        val posts = if (categoryId != null) {
            val category = categoryRepository.findById(categoryId).orElseThrow { IllegalArgumentException("Category not found") }
            postRepository.findAllByCategory(category, pageable)
        } else {
            postRepository.findAll(pageable)
        }

        val currentUser = currentUserId?.let { userRepository.findById(it).orElse(null) }
        val previewLength = systemSettingService.getInt("COMMUNITY_POST_PREVIEW_LENGTH", 100)

        return posts.map { post ->
            val isLiked = currentUser?.let { likeRepository.existsByPostAndUser(post, it) } ?: false
            val isCommented = currentUserId?.let { commentRepository.existsByPostIdAndUserId(post.id, it) } ?: false
            val commentCount = commentRepository.countByPostId(post.id)
            
            val contentPreview = if (post.content.length > previewLength) {
                post.content.substring(0, previewLength) + "..."
            } else {
                post.content
            }

            CommunityPostResponse(
                id = post.id,
                userId = post.user.id,
                userNickname = post.user.nickname,
                userProfileImage = post.user.profileImageUrl,
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
                isLikedByMe = isLiked,
                isCommentedByMe = isCommented,
                imageUrls = post.images.sortedBy { it.sortOrder }.map { it.file.url },
                isMine = currentUser?.id == post.user.id
            )
        }
    }

    @Cacheable("community:categories")
    fun getCategories(): List<CommunityCategoryResponse> {
        println("DEBUG: getCategories called (Cache Miss if seeing this)")
        return getCachedCategoryEntities().map { category ->
            val count = postRepository.countByCategory(category)
            println("DEBUG: Category ${category.name} count: $count")
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
        println("DEBUG: createPost called for user $userId, category ${request.categoryId}")
        val user = userRepository.findById(userId).orElseThrow { IllegalArgumentException("User not found") }
        val category = categoryRepository.findById(request.categoryId).orElseThrow { IllegalArgumentException("Category not found") }
        
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
        
        return CommunityPostResponse(
            id = savedPost.id,
            userId = user.id,
            userNickname = user.nickname,
            userProfileImage = user.profileImageUrl,
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
            imageUrls = savedPost.images.sortedBy { it.sortOrder }.map { it.file.url },
            isMine = true
        )
    }

    @Transactional
    fun toggleLike(userId: Long, postId: Long): Boolean {
        val user = userRepository.findById(userId).orElseThrow { IllegalArgumentException("User not found") }
        val post = postRepository.findById(postId).orElseThrow { IllegalArgumentException("Post not found") }

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
        val user = userRepository.findById(userId).orElseThrow { IllegalArgumentException("User not found") }
        val post = postRepository.findById(postId).orElseThrow { IllegalArgumentException("Post not found") }

        val parentComment = request.parentCommentId?.let {
            commentRepository.findById(it).orElseThrow { IllegalArgumentException("Parent comment not found") }
        }

        val comment = CommunityComment(
            post = post,
            user = user,
            parentComment = parentComment,
            content = request.content
        )
        
        val savedComment = commentRepository.save(comment)
        
        return CommunityCommentResponse(
            id = savedComment.id,
            postId = post.id,
            userId = user.id,
            userNickname = user.nickname,
            userProfileImage = user.profileImageUrl,
            content = savedComment.content,
            createdAt = savedComment.createdAt,
            parentCommentId = parentComment?.id,
            isMine = true
        )
    }

    @Transactional
    fun toggleCommentLike(userId: Long, commentId: Long): Boolean {
        val user = userRepository.findById(userId).orElseThrow { IllegalArgumentException("User not found") }
        val comment = commentRepository.findById(commentId).orElseThrow { IllegalArgumentException("Comment not found") }

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

    fun getPostDetail(postId: Long, currentUserId: Long?): CommunityPostResponse {
        val post = postRepository.findById(postId).orElseThrow { IllegalArgumentException("Post not found") }

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

        // Fetch all comments and sort recursively
        val allComments = commentRepository.findByPostIdOrderByCreatedAtAsc(postId)
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
                        userId = comment.user.id,
                        userNickname = comment.user.nickname,
                        userProfileImage = comment.user.profileImageUrl,
                        content = comment.content,
                        createdAt = comment.createdAt,
                        parentCommentId = comment.parentComment?.id,
                        likeCount = comment.likeCount,
                        isLikedByMe = isCommentLiked,
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

        return CommunityPostResponse(
            id = post.id,
            userId = post.user.id,
            userNickname = post.user.nickname,
            userProfileImage = post.user.profileImageUrl,
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
            isLikedByMe = isLiked,
            isCommentedByMe = isCommented,
            imageUrls = post.images.sortedBy { it.sortOrder }.map { it.file.url },
            comments = comments,
            isMine = currentUserId == post.user.id
        )
    }

    fun getComments(postId: Long, pageable: Pageable): Page<CommunityCommentResponse> {
        val post = postRepository.findById(postId).orElseThrow { IllegalArgumentException("Post not found") }
        return commentRepository.findAllByPost(post, pageable).map { comment ->
            CommunityCommentResponse(
                id = comment.id,
                postId = post.id,
                userId = comment.user.id,
                userNickname = comment.user.nickname,
                userProfileImage = comment.user.profileImageUrl,
                content = comment.content,
                createdAt = comment.createdAt,
                parentCommentId = comment.parentComment?.id
            )
        }
    }

    @Transactional
    fun updatePost(postId: Long, userId: Long, request: CommunityPostUpdateRequest): CommunityPostResponse {
        val post = postRepository.findById(postId).orElseThrow { IllegalArgumentException("Post not found") }
        
        if (post.user.id != userId) {
            throw IllegalArgumentException("Not authorized to update this post")
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
            userId = savedPost.user.id,
            userNickname = savedPost.user.nickname,
            userProfileImage = savedPost.user.profileImageUrl,
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
        val post = postRepository.findById(postId).orElseThrow { IllegalArgumentException("Post not found") }
        
        if (post.user.id != userId) {
            throw IllegalArgumentException("Not authorized to delete this post")
        }

        postRepository.delete(post)
    }

    fun searchPosts(keyword: String, pageable: Pageable, currentUserId: Long?): Page<CommunityPostResponse> {
        val posts = postRepository.searchByKeyword(keyword, pageable)
        val currentUser = currentUserId?.let { userRepository.findById(it).orElse(null) }
        
        return posts.map { post ->
            val isLiked = currentUser?.let { likeRepository.existsByPostAndUser(post, it) } ?: false
            CommunityPostResponse(
                id = post.id,
                userId = post.user.id,
                userNickname = post.user.nickname,
                userProfileImage = post.user.profileImageUrl,
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
                isLikedByMe = isLiked,
                isMine = currentUser?.id == post.user.id
            )
        }
    }
}
