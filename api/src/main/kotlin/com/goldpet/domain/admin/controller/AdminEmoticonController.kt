package com.goldpet.domain.admin.controller

import com.goldpet.domain.admin.service.AdminEmoticonService
import com.goldpet.domain.admin.service.CreateEmoticonRequest
import com.goldpet.domain.admin.service.UpdateEmoticonRequest
import com.goldpet.domain.emoticon.dto.EmoticonPackResponse
import com.goldpet.domain.emoticon.dto.EmoticonResponse
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/admin/emoticons")
class AdminEmoticonController(
    private val adminEmoticonService: AdminEmoticonService
) {
    @GetMapping
    fun getAllEmoticons(): ResponseEntity<List<EmoticonResponse>> {
        return ResponseEntity.ok(adminEmoticonService.getAllEmoticons())
    }

    @GetMapping("/packs")
    fun getAllPacks(): ResponseEntity<List<EmoticonPackResponse>> {
        return ResponseEntity.ok(adminEmoticonService.getAllPacks())
    }

    @PostMapping
    fun createEmoticon(@RequestBody request: CreateEmoticonRequest): ResponseEntity<EmoticonResponse> {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminEmoticonService.createEmoticon(request))
    }

    @PutMapping("/{id}")
    fun updateEmoticon(
        @PathVariable id: Long,
        @RequestBody request: UpdateEmoticonRequest
    ): ResponseEntity<EmoticonResponse> {
        return ResponseEntity.ok(adminEmoticonService.updateEmoticon(id, request))
    }

    @DeleteMapping("/{id}")
    fun deleteEmoticon(@PathVariable id: Long): ResponseEntity<Void> {
        adminEmoticonService.deleteEmoticon(id)
        return ResponseEntity.noContent().build()
    }

    @PatchMapping("/{id}/toggle")
    fun toggleActive(@PathVariable id: Long): ResponseEntity<EmoticonResponse> {
        return ResponseEntity.ok(adminEmoticonService.toggleActive(id))
    }
}
