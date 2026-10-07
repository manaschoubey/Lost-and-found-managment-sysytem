package com.lostfound.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.lostfound.model.Category;

public interface CategoryRepository extends MongoRepository<Category, String> {
}