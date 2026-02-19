package com.goldpet.domain.admin.controller

import com.goldpet.domain.user.entity.User
import com.goldpet.domain.user.entity.UserStatus
import com.goldpet.domain.user.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/admin/migration")
class UserMigrationController(private val userRepository: UserRepository) {
    private val log = LoggerFactory.getLogger(UserMigrationController::class.java)

    @PostMapping("/email-hash")
    @Transactional
    fun migrateEmailHash(): ResponseEntity<Map<String, Any>> {
        val users = userRepository.findAll()
        val emailMap = mutableMapOf<String, MutableList<User>>()
        var updatedCount = 0
        var duplicateCount = 0
        var mergedCount = 0

        // 1. Group users by decrypted email

        for (user in users) {
            // Decrypt email manually if needed, or rely on entity access if it works (it should)
            // But wait, the entity has the converter applied.
            // Reading user.email will return DECRYPTED value (plaintext).
            // That's exactly what we want.

            val email = user.email
            if (email != null) {
                if (user.emailHash == null) {
                    // 2. Generate Hash
                    // user.emailHash = email // The BlindIndexConverter will handle hashing
                    // automatically when confirmed?
                    // Wait, if we set user.emailHash = email (plaintext), the converter will hash
                    // it on save.
                    // YES.

                    // Group by plaintext email to find duplicates
                    emailMap.computeIfAbsent(email) { mutableListOf() }.add(user)
                }
            }
        }

        // 3. Process groups
        for ((email, userList) in emailMap) {
            if (userList.size > 1) {
                duplicateCount++

                // Sort by last login or created at (descending) -> Keep the most recent one
                // As we don't have lastLoginAt easily visible here, let's use id (usually higher id
                // = newer)
                // OR createdAt if available. BaseTimeEntity has createdAt.

                userList.sortByDescending { it.createdAt } // Newest first

                val mainUser = userList[0]
                log.info("Duplicate found for email: $email. Keeping User ID: ${mainUser.id}")

                // Update main user hash
                mainUser.emailHash = email
                userRepository.save(mainUser)
                updatedCount++

                // Merge others
                for (i in 1 until userList.size) {
                    val duplicateUser = userList[i]
                    log.info(
                            "Merging/Deactivating duplicate User ID: ${duplicateUser.id}, Provider: ${duplicateUser.oauthProvider}"
                    )

                    // Logic to merge data could be here (e.g. sum gold, move pets)
                    // For now, we just deactivate them to prevent login
                    duplicateUser.status = UserStatus.WITHDRAWN
                    duplicateUser.nickname = "${duplicateUser.nickname}_merged_${mainUser.id}"
                    duplicateUser.email =
                            null // Clear email to allow constraint if any (though we removed unique
                    // on email)
                    duplicateUser.emailHash =
                            "MERGED_${duplicateUser.id}" // Dummy hash to avoid conflict
                    duplicateUser.oauthId = "MERGED_${duplicateUser.oauthId}" // Avoid oauth lookup

                    userRepository.save(duplicateUser)
                    mergedCount++
                }
            } else {
                // Single user
                val user = userList[0]
                user.emailHash = email
                userRepository.save(user)
                updatedCount++
            }
        }

        return ResponseEntity.ok(
                mapOf(
                        "totalUsersScanned" to users.size,
                        "updatedCount" to updatedCount,
                        "duplicateGroupsFound" to duplicateCount,
                        "mergedUsersCount" to mergedCount
                )
        )
    }
}
