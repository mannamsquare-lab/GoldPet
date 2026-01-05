package com.goldpet.domain.admin.controller

import com.goldpet.domain.admin.dto.CreateBreedRequest
import com.goldpet.domain.admin.dto.UpdateBreedRequest
import com.goldpet.domain.admin.service.BreedAdminService
import com.goldpet.domain.pet.dto.BreedResponse
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.net.URI

@RestController
@RequestMapping("/v1/admin/breeds")
class AdminBreedController(
    private val breedAdminService: BreedAdminService
) {

    @GetMapping
    fun getAllBreeds(
        @RequestParam(required = false) speciesId: Int?
    ): ResponseEntity<List<BreedResponse>> {
        val breeds = if (speciesId != null) {
            breedAdminService.getBreedsBySpecies(speciesId)
        } else {
            breedAdminService.getAllBreeds()
        }
        return ResponseEntity.ok(breeds)
    }

    @GetMapping("/{breedId}")
    fun getBreed(@PathVariable breedId: Int): ResponseEntity<BreedResponse> {
        val breed = breedAdminService.getBreed(breedId)
        return ResponseEntity.ok(breed)
    }

    @PostMapping
    fun createBreed(@RequestBody request: CreateBreedRequest): ResponseEntity<BreedResponse> {
        val created = breedAdminService.createBreed(request)
        return ResponseEntity.created(URI.create("/api/v1/admin/breeds/${created.id}")).body(created)
    }

    @PutMapping("/{breedId}")
    fun updateBreed(
        @PathVariable breedId: Int,
        @RequestBody request: UpdateBreedRequest
    ): ResponseEntity<BreedResponse> {
        val updated = breedAdminService.updateBreed(breedId, request)
        return ResponseEntity.ok(updated)
    }

    @DeleteMapping("/{breedId}")
    fun deleteBreed(@PathVariable breedId: Int): ResponseEntity<Void> {
        breedAdminService.deleteBreed(breedId)
        return ResponseEntity.noContent().build()
    }
}
