package com.goldpet.domain.community.dto

import com.goldpet.domain.community.entity.CommunityPost
import java.time.LocalDateTime
import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class CommunityPostResponse(
    val id: Long,
    val userId: Long,
    val userNickname: String?,
    val userProfileImage: String?,
    val categoryId: Long,
    val categoryName: String,
    val title: String,
    val content: String,
    val visibility: CommunityPost.Visibility,
    val postType: CommunityPost.PostType,
    val viewCount: Int,
    val likeCount: Int,
    val commentCount: Long = 0,
    val createdAt: LocalDateTime,
    @get:JsonProperty("isLikedByMe")
    val isLikedByMe: Boolean = false,
    @get:JsonProperty("isCommentedByMe")
    val isCommentedByMe: Boolean = false,
    val imageUrls: List<String> = emptyList(),
    val comments: List<CommunityCommentResponse> = emptyList(),
    @get:JsonProperty("isMine")
    val isMine: Boolean = false
)

data class CommunityPostCreateRequest(
    val categoryId: Long,
    @field:NotBlank(message = "제목을 입력해주세요")
    @field:Size(max = 100, message = "제목은 100자 이내여야 합니다")
    val title: String,
    @field:NotBlank(message = "내용을 입력해주세요")
    val content: String,
    val visibility: CommunityPost.Visibility = CommunityPost.Visibility.PUBLIC,
    val postType: CommunityPost.PostType = CommunityPost.PostType.GENERAL,
    val imageUrls: List<String> = emptyList()
)

data class CommunityCommentResponse(
    val id: Long,
    val postId: Long,
    val userId: Long,
    val userNickname: String?,
    val userProfileImage: String?,
    val content: String,
    val createdAt: LocalDateTime,
    val parentCommentId: Long?,
    val likeCount: Int = 0,
    @get:JsonProperty("isLikedByMe")
    val isLikedByMe: Boolean = false,
    @get:JsonProperty("isRepliedByMe")
    val isRepliedByMe: Boolean = false,
    val depth: Int = 1,
    val replyCount: Int = 0,
    @get:JsonProperty("isMine")
    val isMine: Boolean = false,
    val postTitle: String? = null
)

data class CommunityCommentCreateRequest(
    @field:NotBlank(message = "댓글 내용을 입력해주세요")
    @field:Size(max = 1000, message = "댓글은 1000자 이내여야 합니다")
    val content: String,
    val parentCommentId: Long? = null
)

data class CommunityCategoryResponse(
    val id: Long,
    val name: String,
    val code: String,
    val postCount: Long = 0
)
