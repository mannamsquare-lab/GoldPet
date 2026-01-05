package com.goldpet.domain.pet.service

import com.goldpet.domain.pet.dto.CreatePetRequest
import com.goldpet.domain.pet.dto.PetResponse
import com.goldpet.domain.pet.dto.SpeciesResponse
import com.goldpet.domain.pet.dto.BreedResponse
import com.goldpet.domain.pet.dto.UpdatePetRequest
import com.goldpet.domain.pet.entity.Pet
import com.goldpet.domain.pet.entity.PetProfileImage
import com.goldpet.domain.pet.repository.PetBreedRepository
import com.goldpet.domain.pet.repository.PetRepository
import com.goldpet.domain.pet.repository.PetSpeciesRepository
import com.goldpet.domain.user.repository.UserRepository
import jakarta.persistence.EntityNotFoundException
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class PetService(
    private val petRepository: PetRepository,
    private val userRepository: UserRepository,
    private val petSpeciesRepository: PetSpeciesRepository,
    private val petBreedRepository: PetBreedRepository,
    private val petAttributeRepository: com.goldpet.domain.pet.repository.PetAttributeRepository
) {

    @Transactional
    fun createPet(userId: Long, request: CreatePetRequest): PetResponse {
        val owner = userRepository.findById(userId).orElseThrow { EntityNotFoundException("User not found") }
        val species = petSpeciesRepository.findById(request.speciesId).orElseThrow { EntityNotFoundException("PetSpecies not found") }
        val breed = request.breedId?.let { petBreedRepository.findById(it).orElseThrow { EntityNotFoundException("PetBreed not found") } }

        val pet = Pet(
            owner = owner,
            name = request.name,
            species = species,
            breed = breed,
            gender = request.gender,
            birthDate = request.birthDate,
            weightKg = request.weightKg,
            isNeutered = request.isNeutered,
            profileImageUrl = request.profileImageUrls?.firstOrNull() ?: request.profileImageUrl,
            temperamentTags = request.temperamentTags
        )

        request.profileImageUrls?.forEachIndexed { index, url ->
            pet.profileImages.add(PetProfileImage(pet = pet, imageUrl = url, orderIndex = index))
        }

        val savedPet = petRepository.save(pet)
        return PetResponse.from(savedPet)
    }

    fun getPet(petId: Long): PetResponse {
        val pet = petRepository.findById(petId).orElseThrow { EntityNotFoundException("Pet not found") }
        return PetResponse.from(pet)
    }

    fun getPetsByOwner(userId: Long): List<PetResponse> {
        val pets = petRepository.findByOwnerId(userId)
        return pets.map { PetResponse.from(it) }
    }

    @Cacheable("pet:species")
    fun getAllSpecies(): List<SpeciesResponse> {
        return petSpeciesRepository.findAll().map { SpeciesResponse.from(it) }
    }

    @Cacheable("breeds", key = "#speciesId")
    fun getBreedsBySpecies(speciesId: Int): List<BreedResponse> {
        return petBreedRepository.findAllByPetSpeciesId(speciesId).map { BreedResponse.from(it) }
    }

    @Cacheable("pet_attributes", key = "'all'")
    fun getPetAttributes(): List<com.goldpet.domain.admin.dto.PetAttributeResponse> {
        return petAttributeRepository.findAllByOrderByDisplayOrderAsc()
            .map { com.goldpet.domain.admin.dto.PetAttributeResponse.from(it) }
    }



    @Transactional
    fun updatePet(petId: Long, request: UpdatePetRequest): PetResponse {
        val pet = petRepository.findById(petId).orElseThrow { EntityNotFoundException("Pet not found") }

        request.name?.let { pet.name = it }
        request.speciesId?.let {
            pet.species = petSpeciesRepository.findById(it).orElseThrow { EntityNotFoundException("PetSpecies not found") }
        }
        request.breedId?.let {
            pet.breed = petBreedRepository.findById(it).orElseThrow { EntityNotFoundException("PetBreed not found") }
        }
        request.gender?.let { pet.gender = it }
        request.birthDate?.let { pet.birthDate = it }
        request.weightKg?.let { pet.weightKg = it }
        request.isNeutered?.let { pet.isNeutered = it }
        request.profileImageUrl?.let { pet.profileImageUrl = it }
        request.profileImageUrls?.let { urls ->
            pet.profileImages.clear()
            urls.forEachIndexed { index, url ->
                pet.profileImages.add(PetProfileImage(pet = pet, imageUrl = url, orderIndex = index))
            }
            pet.profileImageUrl = urls.firstOrNull()
        }
        request.temperamentTags?.let { pet.temperamentTags = it }

        val updatedPet = petRepository.save(pet)
        return PetResponse.from(updatedPet)
    }

    @Transactional
    fun deletePet(petId: Long) {
        if (!petRepository.existsById(petId)) {
            throw EntityNotFoundException("Pet not found")
        }
        petRepository.deleteById(petId)
    }
}
