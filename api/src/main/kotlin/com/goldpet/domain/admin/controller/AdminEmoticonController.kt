package com.goldpet.domain.admin.controller

import com.goldpet.domain.admin.service.AdminEmoticonService
import com.goldpet.domain.admin.service.CreateEmoticonRequest
import com.goldpet.domain.admin.service.UpdateEmoticonRequest
import com.goldpet.domain.emoticon.dto.EmoticonPackResponse
import com.goldpet.domain.emoticon.dto.EmoticonResponse
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@Tag(name = "어드민: 이모티콘 관리", description = "이모티콘 및 이모티콘 팩 CRUD")
@RestController
@RequestMapping("/api/v1/admin/emoticons")
class AdminEmoticonController(
    private val adminEmoticonService: AdminEmoticonService
) {
    @Operation(summary = "전체 이모티콘 목록 조회")
    @GetMapping
    fun getAllEmoticons(): ResponseEntity<List<EmoticonResponse>> {
        return ResponseEntity.ok(adminEmoticonService.getAllEmoticons())
    }

    @Operation(summary = "이모티콘 팩 목록 조회")
    @GetMapping("/packs")
    fun getAllPacks(): ResponseEntity<List<EmoticonPackResponse>> {
        return ResponseEntity.ok(adminEmoticonService.getAllPacks())
    }

    @Operation(summary = "이모티콘 생성")
    @PostMapping
    fun createEmoticon(@RequestBody request: CreateEmoticonRequest): ResponseEntity<EmoticonResponse> {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminEmoticonService.createEmoticon(request))
    }

    @Operation(summary = "이모티콘 수정")
    @PutMapping("/{id}")
    fun updateEmoticon(
        @PathVariable id: Long,
        @RequestBody request: UpdateEmoticonRequest
    ): ResponseEntity<EmoticonResponse> {
        return ResponseEntity.ok(adminEmoticonService.updateEmoticon(id, request))
    }

    @Operation(summary = "이모티콘 삭제")
    @DeleteMapping("/{id}")
    fun deleteEmoticon(@PathVariable id: Long): ResponseEntity<Void> {
        adminEmoticonService.deleteEmoticon(id)
        return ResponseEntity.noContent().build()
    }

    @Operation(summary = "이모티콘 활성/비활성 토글")
    @PatchMapping("/{id}/toggle")
    fun toggleActive(@PathVariable id: Long): ResponseEntity<EmoticonResponse> {
        return ResponseEntity.ok(adminEmoticonService.toggleActive(id))
    }
}
