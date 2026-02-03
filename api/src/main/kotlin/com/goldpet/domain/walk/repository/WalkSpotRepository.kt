package com.goldpet.domain.walk.repository

import com.goldpet.domain.walk.entity.WalkSpot
import org.springframework.data.jpa.repository.JpaRepository

interface WalkSpotRepository : JpaRepository<WalkSpot, Long>
