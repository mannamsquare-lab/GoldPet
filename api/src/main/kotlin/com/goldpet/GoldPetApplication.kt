package com.goldpet

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.data.jpa.repository.config.EnableJpaAuditing

@EnableJpaAuditing
@SpringBootApplication
class GoldPetApplication

fun main(args: Array<String>) {
    runApplication<GoldPetApplication>(*args)
}
