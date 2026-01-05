package com.goldpet.domain.pet.controller

import com.goldpet.domain.pet.dto.BreedResponse
import com.goldpet.domain.pet.dto.SpeciesResponse
import com.goldpet.domain.pet.service.PetService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/pets")
class PetMetadataController(
    private val petService: PetService
) {

    @GetMapping("/species")
    fun getAllSpecies(): ResponseEntity<List<SpeciesResponse>> {
        return ResponseEntity.ok(petService.getAllSpecies())
    }

    @GetMapping("/breeds")
    fun getBreeds(@RequestParam(required = true) speciesId: Int): ResponseEntity<List<BreedResponse>> {
        return ResponseEntity.ok(petService.getBreedsBySpecies(speciesId))
    }

    @GetMapping("/attributes")
    fun getPetAttributes(): ResponseEntity<List<com.goldpet.domain.admin.dto.PetAttributeResponse>> {
        return ResponseEntity.ok(petService.getPetAttributes())
    }
}
