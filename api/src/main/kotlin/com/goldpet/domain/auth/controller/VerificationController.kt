package com.goldpet.domain.auth.controller

import com.goldpet.domain.auth.dto.VerificationConfirmRequest
import com.goldpet.domain.auth.dto.VerificationRequest
import com.goldpet.domain.auth.dto.VerificationResponse
import com.goldpet.domain.auth.service.VerificationService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@Tag(name = "Auth", description = "Authentication & Verification API")
@RestController
@RequestMapping("/api/v1/auth/verification")
class VerificationController(
    private val verificationService: VerificationService
) {

    @Operation(summary = "Request Verification Code", description = "Generates a code and logs it to console (Mock SMS)")
    @PostMapping("/request")
    fun requestVerificationCode(@RequestBody request: VerificationRequest): ResponseEntity<VerificationResponse> {
        verificationService.sendVerificationCode(request.phoneNumber)
        return ResponseEntity.ok(VerificationResponse(true, "인증번호가 발송되었습니다."))
    }

    @Operation(summary = "Confirm Verification Code", description = "Verifies the code sent to the phone number")
    @PostMapping("/confirm")
    fun confirmVerificationCode(@RequestBody request: VerificationConfirmRequest): ResponseEntity<VerificationResponse> {
        val isValid = verificationService.verifyCode(request.phoneNumber, request.code)
        
        return if (isValid) {
            ResponseEntity.ok(VerificationResponse(true, "인증되었습니다."))
        } else {
            ResponseEntity.badRequest().body(VerificationResponse(false, "인증번호가 일치하지 않거나 만료되었습니다."))
        }
    }
}
