package com.wray.hjzdm.converter;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;
import com.wray.hjzdm.dto.CategoryDTO;
import com.wray.hjzdm.entity.Category;

@Component
public class CategoryConverter {

    public CategoryDTO PO2DTO(Category po) {
        if (po == null) {
            return null;
        }
        CategoryDTO dto = new CategoryDTO();
        dto.setCatId(po.getCatId());
        dto.setCatName(po.getCatName());
        dto.setCatPid(po.getCatPid());
        dto.setCatIcon(po.getCatIcon());
        dto.setCatLevel(po.getCatLevel());
        return dto;
    }

    public Category DTO2PO(CategoryDTO dto) {
        if (dto == null) {
            return null;
        }
        Category category = new Category();
        category.setCatId(dto.getCatId());
        category.setCatName(dto.getCatName());
        category.setCatPid(dto.getCatPid());
        category.setCatIcon(dto.getCatIcon());
        category.setCatLevel(dto.getCatLevel());
        return category;
    }

    public List<CategoryDTO> POList2DTOList(List<Category> poList) {
        if (poList == null) {
            return null;
        }
        return poList.stream()
                .map(this::PO2DTO)
                .collect(Collectors.toList());
    }

    public List<Category> DTOList2POList(List<CategoryDTO> dtoList) {
        if (dtoList == null) {
            return null;
        }
        return dtoList.stream()
                .map(this::DTO2PO)
                .collect(Collectors.toList());
    }
}
