package com.pastelaria.domain.repository;

import com.pastelaria.domain.model.ExtraOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExtraOptionRepository extends JpaRepository<ExtraOption, String> {
}
