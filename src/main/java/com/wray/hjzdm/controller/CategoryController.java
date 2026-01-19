package com.wray.hjzdm.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.wray.hjzdm.common.Result;
import com.wray.hjzdm.dto.CategoryAttributeDTO;
import com.wray.hjzdm.dto.CategoryDTO;
import com.wray.hjzdm.service.CategoryService;
import io.swagger.annotations.Api;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/category")
@Api(value = "分类相关接口", tags = {"分类相关接口"})
public class CategoryController {
    @Autowired
    private CategoryService categoryService;

    @PostMapping("/list")
    @Cacheable(value = "category", key = "#root.methodName")
    public Result<List<CategoryDTO>> list() {
        List<CategoryDTO> categoryDTOS = categoryService.listCategoryTree();
        if (categoryDTOS == null || categoryDTOS.size() == 0) {
            return Result.error("分类列表为空");
        }
        return Result.success(categoryDTOS);
    }

    @GetMapping("/attributes")
    public Result<List<CategoryAttributeDTO>> getAttributes(@RequestParam Long catId) {
        return Result.success(categoryService.getCategoryAttributes(catId));
    }
}
