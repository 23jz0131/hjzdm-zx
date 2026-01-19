package com.wray.hjzdm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CategoryAttributeDTO {
    private Long attrId;
    private String attrName;
    private String attrType;
    private List<String> values;
}
