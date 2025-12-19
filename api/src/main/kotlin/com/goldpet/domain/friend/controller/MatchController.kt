import com.goldpet.domain.friend.dto.LikeRequest
import com.goldpet.domain.friend.service.MatchService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@Tag(name = "Match", description = "매칭 관련 API")
@RestController
@RequestMapping("/api/v1/matches")
class MatchController(
    private val matchService: MatchService
) {
    // TODO: 실제 인증 구현 시 @AuthenticationPrincipal 등을 사용하여 userId를 가져오도록 변경
    private val currentUserId: Long = 1L // 임시 사용자 ID

    @Operation(
        summary = "사용자 좋아요",
        description = "다른 사용자를 좋아요합니다. 상호 좋아요 시 매칭이 생성됩니다."
    )
    @ApiResponse(responseCode = "201", description = "매칭 성공")
    @ApiResponse(responseCode = "200", description = "좋아요 성공 (매칭 아님)")
    @ApiResponse(responseCode = "400", description = "잘못된 요청")
    @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음")
    @PostMapping("/like")
    fun likeUser(@RequestBody likeRequest: LikeRequest): ResponseEntity<Map<String, Any>> {
        val toUserId = likeRequest.toUserId
        val isMatchCreated = matchService.likeUser(currentUserId, toUserId)

        val response = mapOf(
            "isMatch" to isMatchCreated,
            "message" to if (isMatchCreated) "It's a match!" else "Like sent successfully."
        )

        return if (isMatchCreated) {
            ResponseEntity.status(HttpStatus.CREATED).body(response)
        } else {
            ResponseEntity.ok(response)
        }
    }
}
