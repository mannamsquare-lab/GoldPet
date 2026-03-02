package com.goldpet.domain.aiprofile.service

import com.goldpet.domain.pet.entity.Pet
import org.springframework.stereotype.Component

@Component
class AIPromptBuilder {

    /**
     * Build a detailed English prompt for Leonardo AI based on pet info and style.
     */
    fun buildPrompt(pet: Pet, stylePrompt: String?, presetId: String?): String {
        val parts = mutableListOf<String>()

        // Base subject
        val species = pet.species.name.lowercase()
        val breed = pet.breed?.name
        val subject = if (breed != null) "$breed $species" else species
        parts.add("A cute $subject portrait")

        // Physical characteristics
        pet.gender?.let { gender ->
            val genderStr = when (gender.uppercase()) {
                "MALE", "M" -> "male"
                "FEMALE", "F" -> "female"
                else -> null
            }
            genderStr?.let { parts.add(it) }
        }

        // Temperament tags
        pet.temperamentTags?.takeIf { it.isNotBlank() }?.let { tags ->
            val tagList = tags.split(",").map { it.trim() }.filter { it.isNotEmpty() }
            if (tagList.isNotEmpty()) {
                parts.add("personality: ${tagList.joinToString(", ")}")
            }
        }

        // Style
        if (!stylePrompt.isNullOrBlank()) {
            parts.add(stylePrompt)
        }

        // Quality boosters
        parts.add("high quality")
        parts.add("detailed")
        parts.add("professional pet photography")

        return parts.joinToString(", ")
    }

    /**
     * Build a negative prompt to avoid common generation artifacts.
     */
    fun buildNegativePrompt(): String {
        return "ugly, deformed, blurry, low quality, text, watermark, human hands, extra limbs, missing limbs"
    }
}
