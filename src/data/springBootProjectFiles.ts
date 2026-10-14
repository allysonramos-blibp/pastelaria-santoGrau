export interface ProjectFile {
  path: string;
  name: string;
  content: string;
  category: 'build' | 'config' | 'entity' | 'repository' | 'service' | 'controller' | 'dto';
}

export const SPRING_BOOT_PROJECT_FILES: ProjectFile[] = [
  // 1. POM.XML
  {
    path: 'pom.xml',
    name: 'pom.xml',
    category: 'build',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
        <relativePath/>
    </parent>

    <groupId>com.pastelaria</groupId>
    <artifactId>pastelaria-api</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <name>pastelaria-api</name>
    <description>API REST para Cardápio Digital e Gestão da Pastelaria com Spring Boot</description>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Starter Web (REST APIs) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Spring Data JPA (Hibernate ORM) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <!-- Spring Boot Starter Validation -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- Spring Boot Starter Security & JWT -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.6</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.6</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.12.6</version>
            <scope>runtime</scope>
        </dependency>

        <!-- H2 Database (Banco em memória pronto para rodar sem instalar nada) -->
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- PostgreSQL Driver (Para quando subir em produção) -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Lombok (Getters, Setters, Construtores automáticos) -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- Spring Boot Starter Test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
`,
  },

  // 2. APPLICATION.PROPERTIES
  {
    path: 'src/main/resources/application.properties',
    name: 'application.properties',
    category: 'config',
    content: `# Porta da API
server.port=8080

# Nome da Aplicação
spring.application.name=pastelaria-api

# Banco de Dados H2 em Memória (Roda direto sem precisar instalar PostgreSQL)
spring.datasource.url=jdbc:h2:mem:pastelariadb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# H2 Console (Acesse em http://localhost:8080/h2-console)
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# Hibernate & JPA
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Logging
logging.level.com.pastelaria=DEBUG
`,
  },

  // 3. MAIN APPLICATION CLASS
  {
    path: 'src/main/java/com/pastelaria/PastelariaApplication.java',
    name: 'PastelariaApplication.java',
    category: 'config',
    content: `package com.pastelaria;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PastelariaApplication {

    public static void main(String[] args) {
        SpringApplication.run(PastelariaApplication.class, args);
        System.out.println("🥟 Pastelaria API rodando com sucesso em: http://localhost:8080/api");
        System.out.println("📊 Console H2 Database: http://localhost:8080/h2-console");
    }
}
`,
  },

  // 4. CORS CONFIGURATION
  {
    path: 'src/main/java/com/pastelaria/config/CorsConfig.java',
    name: 'CorsConfig.java',
    category: 'config',
    content: `package com.pastelaria.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
`,
  },

  // 5. DATA INITIALIZER (Seeds database on first startup)
  {
    path: 'src/main/java/com/pastelaria/config/DataInitializer.java',
    name: 'DataInitializer.java',
    category: 'config',
    content: `package com.pastelaria.config;

import com.pastelaria.domain.model.ExtraOption;
import com.pastelaria.domain.model.Product;
import com.pastelaria.domain.repository.ExtraOptionRepository;
import com.pastelaria.domain.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepo;
    private final ExtraOptionRepository extraRepo;

    public DataInitializer(ProductRepository productRepo, ExtraOptionRepository extraRepo) {
        this.productRepo = productRepo;
        this.extraRepo = extraRepo;
    }

    @Override
    public void run(String... args) {
        if (productRepo.count() == 0) {
            // Seed Pastéis Salgados
            productRepo.save(Product.builder()
                    .id("past-carne")
                    .name("Pastel de Carne Tradicional")
                    .description("Carne moída de primeira refogada, temperada com cebolinha verde, azeitona preta e ovo picado.")
                    .category("salgados")
                    .price(new BigDecimal("13.00"))
                    .available(true)
                    .badge("Mais Pedido")
                    .build());

            productRepo.save(Product.builder()
                    .id("past-queijo")
                    .name("Pastel de Queijo Especial")
                    .description("Dupla camada de mussarela e queijo prato derretidos com orégano fresco.")
                    .category("salgados")
                    .price(new BigDecimal("12.00"))
                    .available(true)
                    .build());

            productRepo.save(Product.builder()
                    .id("past-frangocatupiry")
                    .name("Pastel de Frango com Catupiry")
                    .description("Frango desfiado suculento com generosa camada de Catupiry legítimo.")
                    .category("salgados")
                    .price(new BigDecimal("15.00"))
                    .available(true)
                    .badge("Favorito")
                    .build());

            productRepo.save(Product.builder()
                    .id("past-carneseca")
                    .name("Pastel de Carne Seca com Coalho")
                    .description("Carne seca artesanal na manteiga de garrafa e queijo coalho douradinho.")
                    .category("especiais")
                    .price(new BigDecimal("18.50"))
                    .available(true)
                    .badge("Gourmet")
                    .build());

            // Seed Pastéis Doces
            productRepo.save(Product.builder()
                    .id("past-nutellamorango")
                    .name("Pastel de Nutella com Morangos")
                    .description("Nutella autêntica com morangos frescos picadinhos e açúcar de confeiteiro.")
                    .category("doces")
                    .price(new BigDecimal("16.50"))
                    .available(true)
                    .badge("Campeão Doce")
                    .build());

            productRepo.save(Product.builder()
                    .id("past-romeuejulieta")
                    .name("Pastel Romeu & Julieta Clássico")
                    .description("Queijo minas meia cura derretido com goiabada cascão artesanal.")
                    .category("doces")
                    .price(new BigDecimal("13.50"))
                    .available(true)
                    .build());

            // Seed Bebidas
            productRepo.save(Product.builder()
                    .id("beb-caldocana400")
                    .name("Caldo de Cana Moído na Hora (400ml)")
                    .description("Puro, super geladinho, extraído na hora com opção de limão.")
                    .category("bebidas")
                    .price(new BigDecimal("7.00"))
                    .available(true)
                    .badge("Geladinho")
                    .build());

            // Seed Combos
            productRepo.save(Product.builder()
                    .id("combo-da-feira")
                    .name("Combo Tradicional da Feira")
                    .description("1 Pastel de Carne Tradicional + 1 Caldo de Cana Gelado 400ml.")
                    .category("combos")
                    .price(new BigDecimal("18.90"))
                    .available(true)
                    .badge("Super Oferta")
                    .build());

            System.out.println("✅ Cardápio inicial cadastrado com sucesso no banco!");
        }

        if (extraRepo.count() == 0) {
            extraRepo.save(new ExtraOption("ext-catupiry", "Catupiry Original", new BigDecimal("4.50"), "recheio"));
            extraRepo.save(new ExtraOption("ext-queijo", "Mussarela Extra", new BigDecimal("4.00"), "recheio"));
            extraRepo.save(new ExtraOption("ext-bacon", "Bacon Crocante", new BigDecimal("3.50"), "recheio"));
            extraRepo.save(new ExtraOption("ext-vinagrete", "Vinagrete da Feira", BigDecimal.ZERO, "molho"));
            extraRepo.save(new ExtraOption("ext-maioneseverde", "Maionese Verde Artesanal", new BigDecimal("2.50"), "molho"));
            System.out.println("✅ Adicionais cadastrados com sucesso no banco!");
        }
    }
}
`,
  },

  // 6. ENTITY: PRODUCT
  {
    path: 'src/main/java/com/pastelaria/domain/model/Product.java',
    name: 'Product.java',
    category: 'entity',
    content: `package com.pastelaria.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "tb_products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    @Builder.Default
    private boolean available = true;

    private String badge;
    private String imageUrl;
}
`,
  },

  // 7. ENTITY: EXTRA OPTION
  {
    path: 'src/main/java/com/pastelaria/domain/model/ExtraOption.java',
    name: 'ExtraOption.java',
    category: 'entity',
    content: `package com.pastelaria.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "tb_extras")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExtraOption {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private String category;
}
`,
  },

  // 8. ENTITY: ORDER
  {
    path: 'src/main/java/com/pastelaria/domain/model/Order.java',
    name: 'Order.java',
    category: 'entity',
    content: `package com.pastelaria.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tb_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    private String id;

    private Integer orderNumber;

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String customerPhone;

    @Column(nullable = false)
    private String orderType; // delivery, retirada, mesa

    private String tableNumber;

    // Endereço de entrega
    private String street;
    private String number;
    private String neighborhood;
    private String complement;
    private String reference;

    @Column(nullable = false)
    private String paymentMethod; // pix, cartao_credito, cartao_debito, dinheiro

    private BigDecimal needChangeFor;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal deliveryFee;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Column(nullable = false)
    private String status; // novo, em_preparo, pronto, entregue, cancelado

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
`,
  },

  // 9. ENTITY: ORDER ITEM
  {
    path: 'src/main/java/com/pastelaria/domain/model/OrderItem.java',
    name: 'OrderItem.java',
    category: 'entity',
    content: `package com.pastelaria.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "tb_order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    @JsonIgnore
    private Order order;

    private String productName;
    private String selectedSize;
    private String extrasNames;
    private String notes;

    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}
`,
  },

  // 10. REPOSITORIES
  {
    path: 'src/main/java/com/pastelaria/domain/repository/ProductRepository.java',
    name: 'ProductRepository.java',
    category: 'repository',
    content: `package com.pastelaria.domain.repository;

import com.pastelaria.domain.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    List<Product> findByCategory(String category);
    List<Product> findByAvailableTrue();
}
`,
  },

  {
    path: 'src/main/java/com/pastelaria/domain/repository/ExtraOptionRepository.java',
    name: 'ExtraOptionRepository.java',
    category: 'repository',
    content: `package com.pastelaria.domain.repository;

import com.pastelaria.domain.model.ExtraOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExtraOptionRepository extends JpaRepository<ExtraOption, String> {
}
`,
  },

  {
    path: 'src/main/java/com/pastelaria/domain/repository/OrderRepository.java',
    name: 'OrderRepository.java',
    category: 'repository',
    content: `package com.pastelaria.domain.repository;

import com.pastelaria.domain.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findAllByOrderByCreatedAtDesc();
    List<Order> findByStatus(String status);
}
`,
  },

  // 11. CONTROLLER: HEALTH
  {
    path: 'src/main/java/com/pastelaria/controller/HealthController.java',
    name: 'HealthController.java',
    category: 'controller',
    content: `package com.pastelaria.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "app", "Pastelaria Express API (Spring Boot)",
                "timestamp", LocalDateTime.now().toString(),
                "database", "H2 In-Memory / PostgreSQL"
        ));
    }
}
`,
  },

  // 12. CONTROLLER: PRODUCT
  {
    path: 'src/main/java/com/pastelaria/controller/ProductController.java',
    name: 'ProductController.java',
    category: 'controller',
    content: `package com.pastelaria.controller;

import com.pastelaria.domain.model.Product;
import com.pastelaria.domain.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepo;

    public ProductController(ProductRepository productRepo) {
        this.productRepo = productRepo;
    }

    @GetMapping
    public List<Product> getAllProducts() {
        return productRepo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable String id) {
        return productRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        if (product.getId() == null || product.getId().isBlank()) {
            product.setId("prod-" + UUID.randomUUID().toString().substring(0, 8));
        }
        Product saved = productRepo.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable String id, @RequestBody Product product) {
        return productRepo.findById(id).map(existing -> {
            existing.setName(product.getName());
            existing.setDescription(product.getDescription());
            existing.setCategory(product.getCategory());
            existing.setPrice(product.getPrice());
            existing.setAvailable(product.isAvailable());
            existing.setBadge(product.getBadge());
            return ResponseEntity.ok(productRepo.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/availability")
    public ResponseEntity<Void> updateAvailability(@PathVariable String id, @RequestBody Map<String, Boolean> body) {
        return productRepo.findById(id).map(existing -> {
            if (body.containsKey("available")) {
                existing.setAvailable(body.get("available"));
                productRepo.save(existing);
            }
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        if (productRepo.existsById(id)) {
            productRepo.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
`,
  },

  // 13. CONTROLLER: ORDER
  {
    path: 'src/main/java/com/pastelaria/controller/OrderController.java',
    name: 'OrderController.java',
    category: 'controller',
    content: `package com.pastelaria.controller;

import com.pastelaria.domain.model.Order;
import com.pastelaria.domain.model.OrderItem;
import com.pastelaria.domain.repository.OrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepo;

    public OrderController(OrderRepository orderRepo) {
        this.orderRepo = orderRepo;
    }

    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepo.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable String id) {
        return orderRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        if (order.getId() == null || order.getId().isBlank()) {
            order.setId("ord-" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (order.getOrderNumber() == null) {
            order.setOrderNumber(100 + new Random().nextInt(900));
        }
        if (order.getStatus() == null) {
            order.setStatus("novo");
        }
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        // Vincula os itens do pedido
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                item.setOrder(order);
            }
        }

        Order saved = orderRepo.save(order);
        System.out.println("🛎️ Novo pedido recebido #" + saved.getOrderNumber() + " de " + saved.getCustomerName());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateOrderStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        return orderRepo.findById(id).map(existing -> {
            if (body.containsKey("status")) {
                existing.setStatus(body.get("status"));
                existing.setUpdatedAt(LocalDateTime.now());
                orderRepo.save(existing);
                System.out.println("🔥 Pedido #" + existing.getOrderNumber() + " atualizado para status: " + existing.getStatus());
            }
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
`,
  },

  // 14. CONTROLLER: EXTRA OPTIONS
  {
    path: 'src/main/java/com/pastelaria/controller/ExtraOptionController.java',
    name: 'ExtraOptionController.java',
    category: 'controller',
    content: `package com.pastelaria.controller;

import com.pastelaria.domain.model.ExtraOption;
import com.pastelaria.domain.repository.ExtraOptionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/extras")
public class ExtraOptionController {

    private final ExtraOptionRepository extraRepo;

    public ExtraOptionController(ExtraOptionRepository extraRepo) {
        this.extraRepo = extraRepo;
    }

    @GetMapping
    public List<ExtraOption> getAllExtras() {
        return extraRepo.findAll();
    }

    @PostMapping
    public ResponseEntity<ExtraOption> createExtra(@RequestBody ExtraOption extra) {
        if (extra.getId() == null || extra.getId().isBlank()) {
            extra.setId("ext-" + UUID.randomUUID().toString().substring(0, 8));
        }
        ExtraOption saved = extraRepo.save(extra);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExtra(@PathVariable String id) {
        if (extraRepo.existsById(id)) {
            extraRepo.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
`,
  },

  // 15. SECURITY: JWT UTIL
  {
    path: 'src/main/java/com/pastelaria/security/JwtUtil.java',
    name: 'JwtUtil.java',
    category: 'config',
    content: `package com.pastelaria.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private static final String SECRET_STRING = "pastelaria_santo_grau_secret_key_super_segura_jwt_2026_token";
    private static final SecretKey SECRET_KEY = Keys.hmacShaKeyFor(SECRET_STRING.getBytes(StandardCharsets.UTF_8));
    private static final long EXPIRATION_TIME = 1000L * 60 * 60 * 24 * 7; // 7 dias

    public String generateToken(String username, String role, String name) {
        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .claim("name", name)
                .issuer("pastelaria-santo-grau")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY)
                .compact();
    }

    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(SECRET_KEY)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return (String) extractClaims(token).get("role");
    }

    public boolean isTokenValid(String token) {
        try {
            return extractClaims(token).getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}
`,
  },

  // 16. SECURITY: JWT FILTER
  {
    path: 'src/main/java/com/pastelaria/security/JwtAuthenticationFilter.java',
    name: 'JwtAuthenticationFilter.java',
    category: 'config',
    content: `package com.pastelaria.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            if (jwtUtil.isTokenValid(token)) {
                String username = jwtUtil.extractUsername(token);
                String role = jwtUtil.extractRole(token);

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        username,
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                );

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}
`,
  },

  // 17. SECURITY: SECURITY CONFIG
  {
    path: 'src/main/java/com/pastelaria/security/SecurityConfig.java',
    name: 'SecurityConfig.java',
    category: 'config',
    content: `package com.pastelaria.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Endpoints públicos para CLIENTES (Sem necessidade de login!)
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/orders").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/orders/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/extras/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/health").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()

                        // Endpoints protegidos para o DONO (Exigem JWT)
                        .requestMatchers(HttpMethod.GET, "/api/orders").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/orders/**/status").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
`,
  },

  // 18. CONTROLLER: AUTH CONTROLLER
  {
    path: 'src/main/java/com/pastelaria/controller/AuthController.java',
    name: 'AuthController.java',
    category: 'controller',
    content: `package com.pastelaria.controller;

import com.pastelaria.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtUtil jwtUtil;

    public AuthController(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        if (username != null && ("admin".equalsIgnoreCase(username) || "dona".equalsIgnoreCase(username))
                && password != null && ("admin".equals(password) || "123456".equals(password) || "pastelaria123".equals(password))) {

            String token = jwtUtil.generateToken(username.toLowerCase(), "ADMIN", "Administrador Santo Grau");

            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "type", "Bearer",
                    "user", Map.of(
                            "id", "usr-admin-01",
                            "username", username.toLowerCase(),
                            "name", "Dono da Pastelaria Santo Grau",
                            "role", "ADMIN"
                    )
            ));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Credenciais invalidas. Use usuario 'admin' e senha 'admin'."));
    }
}
`,
  },

  // 19. README / GUIA DE EXECUÇÃO
  {
    path: 'README.md',
    name: 'README.md',
    category: 'config',
    content: `# 🥟 Pastelaria Express - Backend Spring Boot

Backend REST completo em Java 17/21 e Spring Boot 3 para o sistema da Pastelaria.

## 🚀 Como Executar em 1 Minuto

### 1. Pré-requisitos
* Java 17 ou 21 instalado (JDK)
* Maven (ou use a IDE)

### 2. Rodando via Linha de Comando
\`\`\`bash
mvn spring-boot:run
\`\`\`

### 3. Rodando pelo IntelliJ / VS Code / Eclipse
1. Abra a pasta do projeto na sua IDE.
2. Aguarde o Maven baixar as dependências.
3. Abra \`src/main/java/com/pastelaria/PastelariaApplication.java\` e clique em **Run** ▶️.

## 🗄️ Banco de Dados Incluso (Zero Configuração)
O projeto vem configurado por padrão com o banco **H2 em memória**, que inicializa e cria automaticamente as tabelas e dados de teste (Pastel de Carne, Queijo, Frango, Caldo de Cana, etc.).

* Console do banco H2: http://localhost:8080/h2-console
* JDBC URL: \`jdbc:h2:mem:pastelariadb\`
* Usuário: \`sa\` | Senha: em branco

## 🔌 Conexão com o Frontend React
No painel da pastelaria, acesse a aba **"API Spring Boot"** e clique em **"Testar Conexão / Ping"**. O frontend começará a salvar e carregar tudo direto da sua API Java!
`,
  },
];
