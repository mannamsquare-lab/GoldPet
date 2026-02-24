package com.goldpet.domain.pet.dto

import com.fasterxml.jackson.annotation.JsonProperty
import com.goldpet.domain.pet.entity.Pet
import jakarta.validation.constraints.Size
import java.time.LocalDate

data class CreatePetRequest(
    @field:Size(max = 20, message = "반려동물 이름은 20자 이내여야 합니다")
    val name: String,
    val speciesId: Int,
    val breedId: Int?,
    val gender: String?,
    val birthDate: LocalDate?,
    val weightKg: Double?,
    val isNeutered: Boolean?,
    val profileImageUrl: String?,
    val profileImageUrls: List<String>? = emptyList(),
    val temperamentTags: String?,
)

data class UpdatePetRequest(
    @field:Size(max = 20, message = "반려동물 이름은 20자 이내여야 합니다")
    val name: String?,
    val speciesId: Int?,
    val breedId: Int?,
    val gender: String?,
    val birthDate: LocalDate?,
    val weightKg: Double?,
    val isNeutered: Boolean?,
    val profileImageUrl: String?,
    val profileImageUrls: List<String>? = emptyList(),
    val temperamentTags: String?,
)

data class PetResponse(
    val id: Long,
    val ownerId: Long,
    val name: String,
    val speciesId: Int,
    val breedId: Int?,
    val species: String,
    val breed: String?,
    val gender: String?,
    val birthDate: LocalDate?,
    val weightKg: Double?,
    @get:JsonProperty("isNeutered")
    val isNeutered: Boolean?,
    val profileImageUrl: String?,
    val profileImageUrls: List<String>,
    val temperamentTags: List<String>,
) {
    companion object {
        fun from(pet: Pet): PetResponse {
            return PetResponse(
                id = pet.id,
                ownerId = pet.owner.id,
                name = pet.name,
                speciesId = pet.species.id,
                breedId = pet.breed?.id,
                species = pet.species.name,
                breed = pet.breed?.name,
                gender = pet.gender,
                birthDate = pet.birthDate,
                weightKg = pet.weightKg,
                isNeutered = pet.isNeutered,
                profileImageUrl = pet.profileImageUrl,
                profileImageUrls = pet.profileImages.map { it.imageUrl },
                temperamentTags = pet.temperamentTags?.split(",") ?: emptyList()
            )
        }
    }
}

data class SimplePetResponse(
    val id: Long,
    val name: String,
    val profileImageUrl: String?,
) {
    companion object {
        fun from(pet: Pet): SimplePetResponse {
            return SimplePetResponse(
                id = pet.id,
                name = pet.name,
                profileImageUrl = pet.profileImageUrl
            )
        }
    }
}
