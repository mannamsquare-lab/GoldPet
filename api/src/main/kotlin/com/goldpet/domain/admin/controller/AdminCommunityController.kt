package com.goldpet.domain.admin.controller

import com.goldpet.domain.admin.service.AdminCommunityService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

data class PostListItemResponse(
    val id: Long,
    val title: String,
    val content: String,
    val categoryName: String,
    val authorNickname: String,
    val authorId: Long,
    val viewCount: Int,
    val likeCount: Int,
    val commentCount: Int,
    val isHidden: Boolean,
    val createdAt: String?
)

data class PostDetailAdminResponse(
    val id: Long,
    val title: String,
    val content: String,
    val categoryId: Long,
    val categoryName: String,
    val authorId: Long,
    val authorNickname: String,
    val authorProfileImage: String?,
    val imageUrls: List<String>,
    val viewCount: Int,
    val likeCount: Int,
    val commentCount: Int,
    val isHidden: Boolean,
    val createdAt: String?,
    val updatedAt: String?,
    val comments: List<CommentAdminResponse>
)

data class CommentAdminResponse(
    val id: Long,
    val content: String,
    val authorId: Long,
    val authorNickname: String,
    val isHidden: Boolean,
    val createdAt: String?
)

data class HideContentRequest(
    val reason: String?
)

@Tag(name = "Admin Community", description = "관리자 커뮤니티 관리 API")
@RestController
@RequestMapping("/api/v1/admin/community")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
class AdminCommunityController(
    private val communityService: AdminCommunityService
) {

    @Operation(summary = "게시글 목록 조회")
    @GetMapping("/posts")
    fun getPosts(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(required = false) search: String?,
        @RequestParam(required = false) categoryId: Long?,
        @RequestParam(required = false) includeHidden: Boolean = true,
        @RequestParam(defaultValue = "createdAt") sortBy: String,
        @RequestParam(defaultValue = "desc") sortDir: String
    ): ResponseEntity<Page<PostListItemResponse>> {
        val sort = if (sortDir == "asc") Sort.by(sortBy).ascending() else Sort.by(sortBy).descending()
        val pageable = PageRequest.of(page, size, sort)
        return ResponseEntity.ok(communityService.getPosts(pageable, search, categoryId, includeHidden))
    }

    @Operation(summary = "게시글 상세 조회")
    @GetMapping("/posts/{postId}")
    fun getPostDetail(@PathVariable postId: Long): ResponseEntity<PostDetailAdminResponse> {
        return ResponseEntity.ok(communityService.getPostDetail(postId))
    }

    @Operation(summary = "게시글 숨김 처리")
    @PostMapping("/posts/{postId}/hide")
    fun hidePost(
        @PathVariable postId: Long,
        @RequestBody request: HideContentRequest
    ): ResponseEntity<Void> {
        communityService.hidePost(postId, request.reason)
        return ResponseEntity.ok().build()
    }

    @Operation(summary = "게시글 숨김 해제")
    @PostMapping("/posts/{postId}/unhide")
    fun unhidePost(@PathVariable postId: Long): ResponseEntity<Void> {
        communityService.unhidePost(postId)
        return ResponseEntity.ok().build()
    }

    @Operation(summary = "게시글 삭제")
    @DeleteMapping("/posts/{postId}")
    fun deletePost(@PathVariable postId: Long): ResponseEntity<Void> {
        communityService.deletePost(postId)
        return ResponseEntity.noContent().build()
    }

    @Operation(summary = "댓글 숨김 처리")
    @PostMapping("/comments/{commentId}/hide")
    fun hideComment(
        @PathVariable commentId: Long,
        @RequestBody request: HideContentRequest
    ): ResponseEntity<Void> {
        communityService.hideComment(commentId, request.reason)
        return ResponseEntity.ok().build()
    }

    @Operation(summary = "댓글 삭제")
    @DeleteMapping("/comments/{commentId}")
    fun deleteComment(@PathVariable commentId: Long): ResponseEntity<Void> {
        communityService.deleteComment(commentId)
        return ResponseEntity.noContent().build()
    }
}
