package com.pastelaria.config;

import com.pastelaria.domain.model.ExtraOption;
import com.pastelaria.domain.model.Product;
import com.pastelaria.domain.repository.ExtraOptionRepository;
import com.pastelaria.domain.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

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
            productRepo.save(Product.builder()
                    .id("past-carne")
                    .name("Pastel de Carne Tradicional")
                    .description("Carne moida de primeira refogada, temperada com cebolinha verde, azeitona preta e ovo picado.")
                    .category("salgados")
                    .price(new BigDecimal("13.00"))
                    .available(true)
                    .badge("Mais Pedido")
                    .build());

            productRepo.save(Product.builder()
                    .id("past-queijo")
                    .name("Pastel de Queijo Especial")
                    .description("Dupla camada de mussarela e queijo prato derretidos com oregano fresco.")
                    .category("salgados")
                    .price(new BigDecimal("12.00"))
                    .available(true)
                    .build());

            productRepo.save(Product.builder()
                    .id("past-frangocatupiry")
                    .name("Pastel de Frango com Catupiry")
                    .description("Frango desfiado suculento com generosa camada de Catupiry legitimo.")
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

            productRepo.save(Product.builder()
                    .id("past-nutellamorango")
                    .name("Pastel de Nutella com Morangos")
                    .description("Nutella autentica com morangos frescos picadinhos e acucar de confeiteiro.")
                    .category("doces")
                    .price(new BigDecimal("16.50"))
                    .available(true)
                    .badge("Campeao Doce")
                    .build());

            productRepo.save(Product.builder()
                    .id("beb-caldocana400")
                    .name("Caldo de Cana Moido na Hora (400ml)")
                    .description("Puro, super geladinho, extraido na hora com opcao de limao.")
                    .category("bebidas")
                    .price(new BigDecimal("7.00"))
                    .available(true)
                    .badge("Geladinho")
                    .build());

            System.out.println("Cardapio inicial cadastrado com sucesso no banco!");
        }

        if (extraRepo.count() == 0) {
            extraRepo.save(new ExtraOption("ext-catupiry", "Catupiry Original", new BigDecimal("4.50"), "recheio"));
            extraRepo.save(new ExtraOption("ext-queijo", "Mussarela Extra", new BigDecimal("4.00"), "recheio"));
            extraRepo.save(new ExtraOption("ext-bacon", "Bacon Crocante", new BigDecimal("3.50"), "recheio"));
            extraRepo.save(new ExtraOption("ext-vinagrete", "Vinagrete da Feira", BigDecimal.ZERO, "molho"));
            extraRepo.save(new ExtraOption("ext-maioneseverde", "Maionese Verde Artesanal", new BigDecimal("2.50"), "molho"));
            System.out.println("Adicionais cadastrados com sucesso no banco!");
        }
    }
}
