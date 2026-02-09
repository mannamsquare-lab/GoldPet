package com.goldpet.domain.admin.repository

import com.goldpet.domain.admin.entity.Banner
import org.springframework.data.jpa.repository.JpaRepository

interface BannerRepository : JpaRepository<Banner, Long> {
    fun findAllByOrderByDisplayOrderAsc(): List<Banner>
    fun findAllByIsActiveTrueOrderByDisplayOrderAsc(): List<Banner>
}
