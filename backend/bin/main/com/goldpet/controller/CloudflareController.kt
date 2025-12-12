package com.goldpet.controller

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/cdn-cgi")
class CloudflareController {

    @GetMapping("/rum")
    fun handleRum(): ResponseEntity<Void> {
        return ResponseEntity.noContent().build()
    }
}
