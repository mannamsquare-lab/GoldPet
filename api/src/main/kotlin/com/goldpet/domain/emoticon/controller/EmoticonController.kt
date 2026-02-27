package com.goldpet.domain.emoticon.controller

import com.goldpet.domain.emoticon.dto.EmoticonResponse
import com.goldpet.domain.emoticon.service.EmoticonService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/emoticons")
class EmoticonController(
    private val emoticonService: EmoticonService
) {
    @GetMapping
    fun getEmoticons(): ResponseEntity<List<EmoticonResponse>> {
        return ResponseEntity.ok(emoticonService.getActiveEmoticons())
    }
}
