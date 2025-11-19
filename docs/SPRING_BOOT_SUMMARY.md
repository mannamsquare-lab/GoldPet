### Spring Boot 공통 개발 방법 및 주요 특징

1.  **간결한 시작 (`@SpringBootApplication`):**
    -   메인 클래스에 `@SpringBootApplication` 어노테이션 하나만 추가하면, 자동 설정(Auto-Configuration), 빈(Bean) 스캔, 외부 설정 로딩 등 Spring 애플리케이션에 필요한 대부분의 기능이 활성화됩니다.

2.  **Starter 의존성:**
    -   `spring-boot-starter-*` 형태의 'Starter' 의존성은 특정 기능을 구현하는 데 필요한 라이브러리들을 패키지로 묶어 제공합니다. 예를 들어, `spring-boot-starter-web`을 추가하면 내장 Tomcat 서버와 Spring MVC 관련 라이브러리들이 자동으로 포함되어 웹 애플리케이션을 즉시 개발할 수 있습니다.

3.  **자동 설정 (Auto-Configuration):**
    -   Spring Boot는 클래스패스에 있는 라이브러리들을 감지하여 필요한 설정(예: DataSource, EntityManagerFactory)을 자동으로 구성해 줍니다. 이로 인해 개발자는 복잡한 XML 또는 Java 설정을 직접 작성할 필요가 없습니다.

4.  **내장 서버:**
    -   Tomcat, Jetty, Undertow 같은 웹 서버가 내장되어 있어, 애플리케이션을 별도의 서버에 배포할 필요 없이 JAR 파일만으로 독립적으로 실행할 수 있습니다.

5.  **외부 설정 관리:**
    -   `application.properties` 또는 `application.yml` 파일을 사용하여 애플리케이션의 동작을 쉽게 변경할 수 있습니다. 프로필(profile) 기능을 통해 `dev`, `qa`, `prod` 등 환경별로 다른 설정을 적용하는 것도 간단합니다.

### 버전 업그레이드 시 유용한 도구

Spring Boot 버전을 업그레이드할 때 일부 설정 속성(property)의 이름이 변경되거나 제거될 수 있습니다. 이때 `spring-boot-properties-migrator` 의존성을 추가하면 도움이 됩니다.

-   **기능:**
    -   애플리케이션 실행 시 현재 환경의 속성을 분석합니다.
    -   이름이 변경된 속성이 사용되면, 어떤 속성으로 바뀌었는지 알려주는 진단 정보를 출력합니다.
    -   런타임에 이전 속성을 새로운 속성으로 임시 마이그레이션해 주어, 애플리케이션이 정상적으로 실행되도록 돕습니다.

-   **Maven 의존성 추가:**

    ```xml
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-properties-migrator</artifactId>
        <scope>runtime</scope>
    </dependency>
    ```

> **참고:** 이 모듈은 마이그레이션이 완료된 후에는 프로젝트에서 제거하는 것이 좋습니다.
