package com.wray.hjzdm.entity;

import lombok.Data;
import lombok.Builder;
import java.time.LocalDateTime;

@Data
@Builder
public class DisclosureLike {
    private Long id;
    private Long disclosureId;
    private Long userId;
    private LocalDateTime createTime;
}