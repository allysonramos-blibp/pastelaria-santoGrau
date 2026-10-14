package com.pastelaria.controller;

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

        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                item.setOrder(order);
            }
        }

        Order saved = orderRepo.save(order);
        System.out.println("Novo pedido #" + saved.getOrderNumber() + " registrado!");
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateOrderStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        return orderRepo.findById(id).map(existing -> {
            if (body.containsKey("status")) {
                existing.setStatus(body.get("status"));
                existing.setUpdatedAt(LocalDateTime.now());
                orderRepo.save(existing);
            }
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
