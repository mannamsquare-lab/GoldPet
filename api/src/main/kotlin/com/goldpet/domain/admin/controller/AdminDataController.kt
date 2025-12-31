package com.goldpet.domain.admin.controller

import com.goldpet.domain.admin.service.AdminDataService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@Tag(name = "Admin Data", description = "관리자 코드/마스터 데이터 관리 API")
@RestController
@RequestMapping("/v1/admin/data")
class AdminDataController(
    private val adminDataService: AdminDataService
) {
    // Pet Species
    @Operation(summary = "펫 종 목록")
    @GetMapping("/species")
    fun getSpecies(): ResponseEntity<List<Map<String, Any>>> {
        return ResponseEntity.ok(adminDataService.getSpecies())
    }

    @Operation(summary = "펫 종 추가")
    @PostMapping("/species")
    fun createSpecies(@RequestBody request: Map<String, Any>): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(adminDataService.createSpecies(request))
    }

    @Operation(summary = "펫 종 삭제")
    @DeleteMapping("/species/{id}")
    fun deleteSpecies(@PathVariable id: Long): ResponseEntity<Void> {
        adminDataService.deleteSpecies(id)
        return ResponseEntity.noContent().build()
    }

    // Pet Breeds
    @Operation(summary = "펫 품종 목록")
    @GetMapping("/breeds")
    fun getBreeds(@RequestParam(required = false) speciesId: Long?): ResponseEntity<List<Map<String, Any>>> {
        return ResponseEntity.ok(adminDataService.getBreeds(speciesId))
    }

    @Operation(summary = "펫 품종 추가")
    @PostMapping("/breeds")
    fun createBreed(@RequestBody request: Map<String, Any>): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(adminDataService.createBreed(request))
    }

    @Operation(summary = "펫 품종 삭제")
    @DeleteMapping("/breeds/{id}")
    fun deleteBreed(@PathVariable id: Long): ResponseEntity<Void> {
        adminDataService.deleteBreed(id)
        return ResponseEntity.noContent().build()
    }

    // Community Categories
    @Operation(summary = "커뮤니티 카테고리 목록")
    @GetMapping("/categories")
    fun getCategories(): ResponseEntity<List<Map<String, Any>>> {
        return ResponseEntity.ok(adminDataService.getCategories())
    }

    @Operation(summary = "커뮤니티 카테고리 추가")
    @PostMapping("/categories")
    fun createCategory(@RequestBody request: Map<String, Any>): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(adminDataService.createCategory(request))
    }

    @Operation(summary = "커뮤니티 카테고리 삭제")
    @DeleteMapping("/categories/{id}")
    fun deleteCategory(@PathVariable id: Long): ResponseEntity<Void> {
        adminDataService.deleteCategory(id)
        return ResponseEntity.noContent().build()
    }
}
