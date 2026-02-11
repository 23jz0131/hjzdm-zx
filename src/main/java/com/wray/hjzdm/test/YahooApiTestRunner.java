package com.wray.hjzdm.test;

import com.wray.hjzdm.entity.Goods;
import com.wray.hjzdm.util.YahooShoppingApiUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Yahoo API集成测试组件
 */
@Component
public class YahooApiTestRunner implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(YahooApiTestRunner.class);
    
    @Autowired
    private YahooShoppingApiUtil yahooApiUtil;
    
    @Override
    public void run(String... args) throws Exception {
        logger.info("🚀 开始Yahoo API集成测试...");
        
        // 测试搜索功能
        String testKeyword = "ノートパソコン";
        int maxResults = 5;
        
        logger.info("🔍 搜索关键词: {}", testKeyword);
        logger.info("📊 最大结果数: {}", maxResults);
        
        try {
            List<Goods> results = yahooApiUtil.searchGoods(testKeyword, maxResults);
            
            logger.info("✅ Yahoo API测试完成!");
            logger.info("📈 返回商品数量: {}", results.size());
            
            if (!results.isEmpty()) {
                logger.info("📦 商品详情:");
                for (int i = 0; i < Math.min(results.size(), 3); i++) {
                    Goods goods = results.get(i);
                    logger.info("{}. {} - ¥{} - {}", 
                        i + 1, 
                        goods.getGoodsName(),
                        goods.getGoodsPrice(),
                        goods.getGoodsLink()
                    );
                }
                
                // 检查编码质量
                String firstName = results.get(0).getGoodsName();
                logger.info("🔤 编码质量检查:");
                logger.info("   原始名称: {}", firstName);
                logger.info("   字符长度: {}", firstName.length());
                logger.info("   包含日文: {}", firstName.matches(".*[\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FFF].*"));
                
            } else {
                logger.warn("⚠️  未获取到任何商品数据");
            }
            
        } catch (Exception e) {
            logger.error("❌ Yahoo API测试失败: ", e);
        }
        
        logger.info("🏁 Yahoo API集成测试结束");
    }
}