package com.goldpet.domain.pet.controller

import com.goldpet.domain.pet.dto.CreatePetRequest
import com.goldpet.domain.pet.dto.PetResponse
import com.goldpet.domain.pet.dto.UpdatePetRequest
import com.goldpet.domain.pet.service.PetService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.net.URI
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails

@RestController
@RequestMapping("/api/v1/pets")
class PetController(
    private val petService: PetService,
    private val userService: com.goldpet.domain.user.service.UserService
) {

    @PostMapping
    fun createPet(
        @AuthenticationPrincipal principal: UserDetails?,
        @RequestBody request: CreatePetRequest
    ): ResponseEntity<PetResponse> {
        if (principal == null) return ResponseEntity.status(401).build()
        val userId = userService.getUserIdFromPrincipal(principal)
        val petResponse = petService.createPet(userId, request)
        return ResponseEntity.created(URI.create("/api/v1/pets/${petResponse.id}")).body(petResponse)
    }

    @GetMapping("/{petId}")
    fun getPet(@PathVariable petId: Long): ResponseEntity<PetResponse> {
        val petResponse = petService.getPet(petId)
        return ResponseEntity.ok(petResponse)
    }

    @GetMapping("/my")
    fun getMyPets(@AuthenticationPrincipal principal: UserDetails?): ResponseEntity<List<PetResponse>> {
        if (principal == null) return ResponseEntity.status(401).build()
        val userId = userService.getUserIdFromPrincipal(principal)
        val petResponses = petService.getPetsByOwner(userId)
        return ResponseEntity.ok(petResponses)
    }

    @PutMapping("/{petId}")
    fun updatePet(
        @PathVariable petId: Long,
        @RequestBody request: UpdatePetRequest
    ): ResponseEntity<PetResponse> {
        // TODO: Verify ownership?
        val petResponse = petService.updatePet(petId, request)
        return ResponseEntity.ok(petResponse)
    }

    @DeleteMapping("/{petId}")
    fun deletePet(@PathVariable petId: Long): ResponseEntity<Void> {
        // TODO: Verify ownership?
        petService.deletePet(petId)
        return ResponseEntity.noContent().build()
    }
}
