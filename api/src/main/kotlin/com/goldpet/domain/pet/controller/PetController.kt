package com.goldpet.domain.pet.controller

import com.goldpet.domain.pet.dto.CreatePetRequest
import com.goldpet.domain.pet.dto.PetResponse
import com.goldpet.domain.pet.dto.UpdatePetRequest
import com.goldpet.domain.pet.service.PetService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.net.URI

@RestController
@RequestMapping("/api/v1/pets")
class PetController(
    private val petService: PetService
) {

    // TODO: Replace with actual authenticated user ID
    private val currentUserId: Long = 1

    @PostMapping
    fun createPet(@RequestBody request: CreatePetRequest): ResponseEntity<PetResponse> {
        val petResponse = petService.createPet(currentUserId, request)
        return ResponseEntity.created(URI.create("/api/v1/pets/${petResponse.id}")).body(petResponse)
    }

    @GetMapping("/{petId}")
    fun getPet(@PathVariable petId: Long): ResponseEntity<PetResponse> {
        val petResponse = petService.getPet(petId)
        return ResponseEntity.ok(petResponse)
    }

    @GetMapping("/my")
    fun getMyPets(): ResponseEntity<List<PetResponse>> {
        val petResponses = petService.getPetsByOwner(currentUserId)
        return ResponseEntity.ok(petResponses)
    }

    @PutMapping("/{petId}")
    fun updatePet(@PathVariable petId: Long, @RequestBody request: UpdatePetRequest): ResponseEntity<PetResponse> {
        val petResponse = petService.updatePet(petId, request)
        return ResponseEntity.ok(petResponse)
    }

    @DeleteMapping("/{petId}")
    fun deletePet(@PathVariable petId: Long): ResponseEntity<Void> {
        petService.deletePet(petId)
        return ResponseEntity.noContent().build()
    }
}
