package com.goldpet.domain.admin.controller

import com.goldpet.domain.admin.dto.PetAttributeRequest
import com.goldpet.domain.admin.dto.PetAttributeResponse
import com.goldpet.domain.admin.service.AttributeAdminService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.net.URI

@RestController
@RequestMapping("/api/v1/admin/pet-attributes")
class AdminAttributeController(
    private val attributeService: AttributeAdminService
) {

    @GetMapping
    fun getAllAttributes(): ResponseEntity<List<PetAttributeResponse>> {
        return ResponseEntity.ok(attributeService.getAllAttributes())
    }

    @PostMapping
    fun createAttribute(@RequestBody request: PetAttributeRequest): ResponseEntity<PetAttributeResponse> {
        val created = attributeService.createAttribute(request)
        return ResponseEntity.created(URI.create("/api/v1/admin/pet-attributes/${created.id}")).body(created)
    }

    @PutMapping("/{id}")
    fun updateAttribute(
        @PathVariable id: Long,
        @RequestBody request: PetAttributeRequest
    ): ResponseEntity<PetAttributeResponse> {
        return ResponseEntity.ok(attributeService.updateAttribute(id, request))
    }

    @DeleteMapping("/{id}")
    fun deleteAttribute(@PathVariable id: Long): ResponseEntity<Void> {
        attributeService.deleteAttribute(id)
        return ResponseEntity.noContent().build()
    }
}
