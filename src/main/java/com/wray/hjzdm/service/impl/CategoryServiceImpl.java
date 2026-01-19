package com.wray.hjzdm.service.impl;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.wray.hjzdm.dto.CategoryAttributeDTO;
import com.wray.hjzdm.entity.CategoryAttribute;
import com.wray.hjzdm.entity.GoodsAttribute;
import com.wray.hjzdm.mapper.CategoryAttributeMapper;
import com.wray.hjzdm.mapper.GoodsAttributeMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.wray.hjzdm.converter.CategoryConverter;
import com.wray.hjzdm.dto.CategoryDTO;
import com.wray.hjzdm.entity.Category;
import com.wray.hjzdm.mapper.CategoryMapper;
import com.wray.hjzdm.service.CategoryService;

@Service
public class CategoryServiceImpl extends ServiceImpl<CategoryMapper, Category> implements CategoryService {
    @Autowired
    CategoryConverter categoryConverter;

    @Autowired
    private CategoryAttributeMapper categoryAttributeMapper;

    @Autowired
    private GoodsAttributeMapper goodsAttributeMapper;

    @Override
    public List<CategoryDTO> listCategoryTree() {
        List<Category> categories = this.list();
        List<CategoryDTO> categoryDTOS = categoryConverter.POList2DTOList(categories);
        List<CategoryDTO> result = categoryDTOS.stream()
                .filter((categoryDTO) -> categoryDTO.getCatPid() == 0)
                .map((categoryDTO) -> {
                    categoryDTO.setChildren(getChildren(categoryDTO, categoryDTOS));
                    return categoryDTO;
                })
                .collect(Collectors.toList());
        return result;
    }
    @Override
    public List<CategoryDTO> getChildren(CategoryDTO father, List<CategoryDTO> all) {
        List<CategoryDTO> children = all.stream()
                .filter(categoryDTO -> Objects.equals(categoryDTO.getCatPid(), father.getCatId()))
                .map(categoryDTO -> {
                    categoryDTO.setChildren(getChildren(categoryDTO, all));
                    return categoryDTO;
                })
                .collect(Collectors.toList());
        return children;
    }

    @Override
    public List<CategoryAttributeDTO> getCategoryAttributes(Long catId) {
        // 1. Get attributes defined for this category
        List<CategoryAttribute> attributes = categoryAttributeMapper.selectList(
                new LambdaQueryWrapper<CategoryAttribute>().eq(CategoryAttribute::getCatId, catId)
        );

        // 2. Map to DTO and fetch values
        return attributes.stream().map(attr -> {
            // Fetch distinct values for this attribute
            QueryWrapper<GoodsAttribute> queryWrapper = new QueryWrapper<>();
            queryWrapper.select("DISTINCT ATTR_VALUE")
                    .eq("ATTR_ID", attr.getAttrId());
            List<Object> values = goodsAttributeMapper.selectObjs(queryWrapper);

            List<String> stringValues = values.stream()
                    .filter(Objects::nonNull)
                    .map(Object::toString)
                    .collect(Collectors.toList());

            return CategoryAttributeDTO.builder()
                    .attrId(attr.getAttrId())
                    .attrName(attr.getAttrName())
                    .attrType(attr.getAttrType())
                    .values(stringValues)
                    .build();
        }).collect(Collectors.toList());
    }
}
