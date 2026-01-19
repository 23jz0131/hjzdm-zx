package com.wray.hjzdm.service;
import java.util.List;
import com.baomidou.mybatisplus.extension.service.IService;
import com.wray.hjzdm.dto.CategoryAttributeDTO;
import com.wray.hjzdm.dto.CategoryDTO;
import com.wray.hjzdm.entity.Category;
public interface CategoryService extends IService<Category> {

    List<CategoryDTO> listCategoryTree();

    List<CategoryDTO> getChildren(CategoryDTO father, List<CategoryDTO> all);

    /**
     * Get attributes and available values for a category
     */
    List<CategoryAttributeDTO> getCategoryAttributes(Long catId);
}
