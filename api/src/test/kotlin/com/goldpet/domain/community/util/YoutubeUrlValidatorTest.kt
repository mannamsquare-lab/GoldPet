package com.goldpet.domain.community.util

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test

class YoutubeUrlValidatorTest {

    private val canonical = "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"

    @Test
    fun `watch url returns canonical`() {
        assertEquals(canonical, YoutubeUrlValidator.normalize("https://www.youtube.com/watch?v=dQw4w9WgXcQ"))
    }

    @Test
    fun `youtu-be short url returns canonical`() {
        assertEquals(canonical, YoutubeUrlValidator.normalize("https://youtu.be/dQw4w9WgXcQ"))
    }

    @Test
    fun `shorts url returns canonical`() {
        assertEquals(canonical, YoutubeUrlValidator.normalize("https://www.youtube.com/shorts/dQw4w9WgXcQ"))
    }

    @Test
    fun `embed url returns canonical`() {
        assertEquals(canonical, YoutubeUrlValidator.normalize("https://www.youtube.com/embed/dQw4w9WgXcQ"))
    }

    @Test
    fun `mobile watch url returns canonical`() {
        assertEquals(canonical, YoutubeUrlValidator.normalize("https://m.youtube.com/watch?v=dQw4w9WgXcQ"))
    }

    @Test
    fun `suffix attack returns null`() {
        assertNull(YoutubeUrlValidator.normalize("https://www.youtube.com.evil.com/watch?v=dQw4w9WgXcQ"))
    }

    @Test
    fun `mixed case host and scheme returns canonical`() {
        assertEquals(canonical, YoutubeUrlValidator.normalize("HTTPS://WWW.YOUTUBE.COM/watch?v=dQw4w9WgXcQ"))
    }

    @Test
    fun `fragment is dropped and returns canonical`() {
        assertEquals(canonical, YoutubeUrlValidator.normalize("https://youtu.be/dQw4w9WgXcQ#t=30"))
    }

    @Test
    fun `blank input returns null`() {
        assertNull(YoutubeUrlValidator.normalize(""))
        assertNull(YoutubeUrlValidator.normalize("   "))
    }

    @Test
    fun `null input returns null`() {
        assertNull(YoutubeUrlValidator.normalize(null))
    }

    @Test
    fun `shorts with query returns canonical`() {
        assertEquals(canonical, YoutubeUrlValidator.normalize("https://www.youtube.com/shorts/dQw4w9WgXcQ?feature=share"))
    }

    @Test
    fun `playlist with v param returns canonical`() {
        assertEquals(canonical, YoutubeUrlValidator.normalize("https://www.youtube.com/watch?list=PLabc&v=dQw4w9WgXcQ"))
    }

    @Test
    fun `javascript scheme returns null`() {
        assertNull(YoutubeUrlValidator.normalize("javascript:alert(1)"))
    }

    @Test
    fun `arbitrary host returns null`() {
        assertNull(YoutubeUrlValidator.normalize("https://evil.com/watch?v=dQw4w9WgXcQ"))
    }

    @Test
    fun `short video id returns null`() {
        assertNull(YoutubeUrlValidator.normalize("https://youtu.be/short"))
    }
}
