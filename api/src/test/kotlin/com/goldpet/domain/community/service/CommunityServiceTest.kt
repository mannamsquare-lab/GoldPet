package com.goldpet.domain.community.service

import com.goldpet.domain.community.dto.CommunityCommentCreateRequest
import com.goldpet.domain.community.dto.CommunityPostCreateRequest
import com.goldpet.domain.community.dto.CommunityPostUpdateRequest
import com.goldpet.domain.community.entity.CommunityCategory
import com.goldpet.domain.community.entity.CommunityComment
import com.goldpet.domain.community.entity.CommunityPost
import com.goldpet.domain.community.entity.CommunityPostLike
import com.goldpet.domain.community.repository.*
import com.goldpet.domain.common.repository.FileAttachmentRepository
import com.goldpet.domain.common.service.SystemSettingService
import com.goldpet.domain.user.entity.User
import com.goldpet.domain.user.repository.UserRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.Mock
import org.mockito.MockitoAnnotations
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import java.time.LocalDateTime
import java.util.*

class CommunityServiceTest {

    @Mock
    private lateinit var postRepository: CommunityPostRepository

    @Mock
    private lateinit var categoryRepository: CommunityCategoryRepository

    @Mock
    private lateinit var commentRepository: CommunityCommentRepository

    @Mock
    private lateinit var likeRepository: CommunityPostLikeRepository

    @Mock
    private lateinit var commentLikeRepository: CommunityCommentLikeRepository

    @Mock
    private lateinit var userRepository: UserRepository

    @Mock
    private lateinit var fileRepository: FileAttachmentRepository

    @Mock
    private lateinit var systemSettingService: SystemSettingService

    private lateinit var communityService: CommunityService

    private lateinit var testUser: User
    private lateinit var testCategory: CommunityCategory
    private lateinit var testPost: CommunityPost

    @BeforeEach
    fun setUp() {
        MockitoAnnotations.openMocks(this)
        communityService = CommunityService(
            postRepository,
            categoryRepository,
            commentRepository,
            likeRepository,
            commentLikeRepository,
            userRepository,
            fileRepository,
            systemSettingService
        )

        testUser = createTestUser(1L, "testuser", "테스트유저")

        testCategory = CommunityCategory(
            id = 1L,
            code = "FREE",
            name = "자유게시판"
        )

        testPost = CommunityPost(
            id = 1L,
            user = testUser,
            category = testCategory,
            title = "테스트 게시글",
            content = "테스트 내용입니다.",
            visibility = CommunityPost.Visibility.PUBLIC,
            postType = CommunityPost.PostType.GENERAL
        ).apply {
            createdAt = LocalDateTime.now()
            updatedAt = LocalDateTime.now()
        }
    }

    private fun createTestUser(id: Long, oauthId: String, nickname: String): User {
        return User(
            id = id,
            email = "$oauthId@example.com",
            oauthProvider = "LOCAL",
            oauthId = oauthId,
            username = oauthId,
            password = "password",
            nickname = nickname,
            name = nickname,
            birthDate = null,
            phoneNumber = null,
            gender = null,
            birthYear = null,
            mainLocationText = null,
            mainLocationGeom = null,
            profileImageUrl = null
        )
    }

    @Test
    fun `getCategories should return all categories`() {
        // Given
        val categories = listOf(
            CommunityCategory(id = 1L, code = "FREE", name = "자유게시판"),
            CommunityCategory(id = 2L, code = "QNA", name = "질문게시판")
        )
        whenever(categoryRepository.findAll()).thenReturn(categories)
        whenever(postRepository.countByCategory(any())).thenReturn(10L)

        // When
        val result = communityService.getCategories()

        // Then
        assertEquals(2, result.size)
        assertEquals("자유게시판", result[0].name)
        assertEquals("질문게시판", result[1].name)
        assertEquals("FREE", result[0].code)
    }

    @Test
    fun `createPost should create new post`() {
        // Given
        val request = CommunityPostCreateRequest(
            categoryId = 1L,
            title = "새 게시글",
            content = "게시글 내용입니다.",
            imageUrls = emptyList(),
            visibility = CommunityPost.Visibility.PUBLIC,
            postType = CommunityPost.PostType.GENERAL
        )

        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory))
        whenever(postRepository.save(any<CommunityPost>())).thenAnswer { invocation ->
            val post = invocation.getArgument<CommunityPost>(0)
            CommunityPost(
                id = 1L,
                user = post.user,
                category = post.category,
                title = post.title,
                content = post.content,
                visibility = post.visibility,
                postType = post.postType
            ).apply {
                createdAt = LocalDateTime.now()
                updatedAt = LocalDateTime.now()
            }
        }

        // When
        val result = communityService.createPost(1L, request)

        // Then
        assertNotNull(result)
        assertEquals("새 게시글", result.title)
        assertEquals("게시글 내용입니다.", result.content)
    }

    @Test
    fun `createPost should throw exception when user not found`() {
        // Given
        val request = CommunityPostCreateRequest(
            categoryId = 1L,
            title = "새 게시글",
            content = "게시글 내용입니다."
        )
        whenever(userRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        assertThrows<IllegalArgumentException> {
            communityService.createPost(999L, request)
        }
    }

    @Test
    fun `createPost should throw exception when category not found`() {
        // Given
        val request = CommunityPostCreateRequest(
            categoryId = 999L,
            title = "새 게시글",
            content = "게시글 내용입니다."
        )
        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(categoryRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        assertThrows<IllegalArgumentException> {
            communityService.createPost(1L, request)
        }
    }

    @Test
    fun `getPostDetail should return post with details`() {
        // Given
        whenever(postRepository.findById(1L)).thenReturn(Optional.of(testPost))
        whenever(postRepository.save(any<CommunityPost>())).thenReturn(testPost)
        whenever(likeRepository.existsByPostAndUser(any(), any())).thenReturn(false)
        whenever(commentRepository.existsByPostIdAndUserId(any(), any())).thenReturn(false)
        whenever(commentRepository.countByPostId(1L)).thenReturn(0L)
        whenever(commentRepository.findByPostIdOrderByCreatedAtAsc(1L)).thenReturn(emptyList())
        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))

        // When
        val result = communityService.getPostDetail(1L, 1L)

        // Then
        assertNotNull(result)
        assertEquals("테스트 게시글", result.title)
        assertEquals("테스트 내용입니다.", result.content)
    }

    @Test
    fun `getPostDetail should throw exception when post not found`() {
        // Given
        whenever(postRepository.findById(999L)).thenReturn(Optional.empty())

        // When & Then
        assertThrows<IllegalArgumentException> {
            communityService.getPostDetail(999L, 1L)
        }
    }

    @Test
    fun `toggleLike should add like when not exists`() {
        // Given
        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(postRepository.findById(1L)).thenReturn(Optional.of(testPost))
        whenever(likeRepository.findByPostAndUser(testPost, testUser)).thenReturn(null)
        whenever(likeRepository.save(any<CommunityPostLike>())).thenAnswer { it.getArgument(0) }

        // When
        val result = communityService.toggleLike(1L, 1L)

        // Then
        assertTrue(result)
    }

    @Test
    fun `toggleLike should remove like when exists`() {
        // Given
        val existingLike = CommunityPostLike(
            id = 1L,
            post = testPost,
            user = testUser
        )
        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(postRepository.findById(1L)).thenReturn(Optional.of(testPost))
        whenever(likeRepository.findByPostAndUser(testPost, testUser)).thenReturn(existingLike)

        // When
        val result = communityService.toggleLike(1L, 1L)

        // Then
        assertFalse(result)
    }

    @Test
    fun `createComment should create new comment`() {
        // Given
        val request = CommunityCommentCreateRequest(
            content = "댓글 내용입니다.",
            parentCommentId = null
        )

        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(postRepository.findById(1L)).thenReturn(Optional.of(testPost))
        whenever(commentRepository.save(any<CommunityComment>())).thenAnswer { invocation ->
            val comment = invocation.getArgument<CommunityComment>(0)
            CommunityComment(
                id = 1L,
                post = comment.post,
                user = comment.user,
                content = comment.content,
                parentComment = comment.parentComment
            ).apply {
                createdAt = LocalDateTime.now()
                updatedAt = LocalDateTime.now()
            }
        }

        // When
        val result = communityService.createComment(1L, 1L, request)

        // Then
        assertNotNull(result)
        assertEquals("댓글 내용입니다.", result.content)
    }

    @Test
    fun `updatePost should update post when user is author`() {
        // Given
        val request = CommunityPostUpdateRequest(
            title = "수정된 제목",
            content = "수정된 내용"
        )

        whenever(postRepository.findById(1L)).thenReturn(Optional.of(testPost))
        whenever(postRepository.save(any<CommunityPost>())).thenReturn(testPost)

        // When
        val result = communityService.updatePost(1L, 1L, request)

        // Then
        assertEquals("수정된 제목", result.title)
        assertEquals("수정된 내용", result.content)
    }

    @Test
    fun `updatePost should throw exception when user is not author`() {
        // Given
        val request = CommunityPostUpdateRequest(title = "수정된 제목")
        whenever(postRepository.findById(1L)).thenReturn(Optional.of(testPost))

        // When & Then - user 999 is not the author
        assertThrows<IllegalArgumentException> {
            communityService.updatePost(1L, 999L, request)
        }
    }

    @Test
    fun `deletePost should delete post when user is author`() {
        // Given
        whenever(postRepository.findById(1L)).thenReturn(Optional.of(testPost))

        // When & Then
        assertDoesNotThrow {
            communityService.deletePost(1L, 1L)
        }
    }

    @Test
    fun `deletePost should throw exception when user is not author`() {
        // Given
        whenever(postRepository.findById(1L)).thenReturn(Optional.of(testPost))

        // When & Then
        assertThrows<IllegalArgumentException> {
            communityService.deletePost(1L, 999L)
        }
    }

    @Test
    fun `getPosts should return paginated posts`() {
        // Given
        val pageable = PageRequest.of(0, 10)
        val posts = listOf(testPost)
        val page = PageImpl(posts, pageable, 1)

        whenever(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory))
        whenever(postRepository.findAllByCategory(testCategory, pageable)).thenReturn(page)
        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(likeRepository.existsByPostAndUser(any(), any())).thenReturn(false)
        whenever(commentRepository.existsByPostIdAndUserId(any(), any())).thenReturn(false)
        whenever(commentRepository.countByPostId(any())).thenReturn(0L)
        whenever(systemSettingService.getInt(any(), any())).thenReturn(100)

        // When
        val result = communityService.getPosts(1L, pageable, 1L)

        // Then
        assertEquals(1, result.content.size)
        assertEquals("테스트 게시글", result.content[0].title)
    }

    @Test
    fun `searchPosts should return matching posts`() {
        // Given
        val pageable = PageRequest.of(0, 10)
        val posts = listOf(testPost)
        val page = PageImpl(posts, pageable, 1)

        whenever(postRepository.searchByKeyword("테스트", pageable)).thenReturn(page)
        whenever(userRepository.findById(1L)).thenReturn(Optional.of(testUser))
        whenever(likeRepository.existsByPostAndUser(any(), any())).thenReturn(false)

        // When
        val result = communityService.searchPosts("테스트", pageable, 1L)

        // Then
        assertEquals(1, result.content.size)
    }
}
