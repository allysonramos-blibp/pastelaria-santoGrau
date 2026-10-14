package com.pastelaria.controller;

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
