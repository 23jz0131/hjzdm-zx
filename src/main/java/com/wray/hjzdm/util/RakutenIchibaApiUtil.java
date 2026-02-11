package com.wray.hjzdm.util;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import com.wray.hjzdm.entity.Goods;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.net.ssl.HttpsURLConnection;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Component
public class RakutenIchibaApiUtil {
    
    private static final Logger logger = LoggerFactory.getLogger(RakutenIchibaApiUtil.class);
    
    @Value("${rakuten.app-id:#{null}}")
    private String appId;
    
    @Value("${rakuten.affiliate-id:#{null}}")
    private String affiliateId;
    
    private static final String RAKUTEN_API_URL = "https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706";
    
    /**
     * 搜索乐天商品
     */
    public List<Goods> searchGoods(String keyword, int maxResults) {
        List<Goods> goodsList = new ArrayList<>();
        
        if (appId == null || appId.isEmpty()) {
            logger.warn("Rakuten API App ID not configured");
            return goodsList;
        }
        
        try {
            String encodedKeyword = URLEncoder.encode(keyword, StandardCharsets.UTF_8.toString());
            StringBuilder urlBuilder = new StringBuilder(RAKUTEN_API_URL);
            urlBuilder.append("?applicationId=").append(appId);
            urlBuilder.append("&keyword=").append(encodedKeyword);
            urlBuilder.append("&hits=").append(maxResults);
            urlBuilder.append("&format=json");
            
            if (affiliateId != null && !affiliateId.isEmpty()) {
                urlBuilder.append("&affiliateId=").append(affiliateId);
            }
            
            String url = urlBuilder.toString();
            logger.info("Rakuten API 请求URL: {}", url);
            
            HttpsURLConnection connection = (HttpsURLConnection) new java.net.URL(url).openConnection();
            connection.setRequestMethod("GET");
            connection.setRequestProperty("User-Agent", "Mozilla/5.0");
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(15000);
            
            int responseCode = connection.getResponseCode();
            logger.info("Rakuten API 响应状态码: {}", responseCode);
            
            if (responseCode == 200) {
                // 尝试检测实际编码
                String contentType = connection.getContentType();
                String charset = "UTF-8"; // 默认UTF-8
                
                // 从Content-Type头中提取字符集
                if (contentType != null && contentType.contains("charset=")) {
                    String[] parts = contentType.split("charset=");
                    if (parts.length > 1) {
                        charset = parts[1].split(";")[0].trim();
                    }
                }
                
                logger.info("检测到响应编码: {}", charset);
                BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream(), charset));
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                reader.close();
                
                String jsonResponse = response.toString();
                logger.info("Rakuten API 响应长度: {} 字符", jsonResponse.length());
                
                // 解析JSON响应
                JSONObject jsonObject = JSON.parseObject(jsonResponse);
                
                if (jsonObject.containsKey("Items")) {
                    com.alibaba.fastjson2.JSONArray itemsArray = jsonObject.getJSONArray("Items");
                    logger.info("Rakuten API 返回商品数: {}", itemsArray.size());
                    
                    for (int i = 0; i < itemsArray.size() && goodsList.size() < maxResults; i++) {
                        try {
                            JSONObject itemObj = itemsArray.getJSONObject(i);
                            if (itemObj.containsKey("Item")) {
                                JSONObject item = itemObj.getJSONObject("Item");
                                
                                // 检查必要字段
                                if (item.getString("itemName") != null && 
                                    item.getString("itemUrl") != null && 
                                    item.getString("itemPrice") != null) {
                                    
                                    Goods goods = new Goods();
                                    goods.setGoodsName(item.getString("itemName"));
                                    goods.setGoodsPrice(Double.parseDouble(item.getString("itemPrice")));
                                    goods.setGoodsLink(item.getString("itemUrl"));
                                    goods.setImgUrl(item.getString("mediumImageUrls") != null ? 
                                        extractImageUrl(item.getJSONArray("mediumImageUrls")) : "");
                                    goods.setMallType(10); // 乐天平台标识
                                    
                                    // 设置其他字段
                                    goods.setGoodsId(System.currentTimeMillis() + i + 10000);
                                    goods.setCreateTime(new java.util.Date());
                                    
                                    goodsList.add(goods);
                                    logger.debug("添加乐天商品: {} - ¥{}", 
                                        goods.getGoodsName(), goods.getGoodsPrice());
                                }
                            }
                        } catch (Exception e) {
                            logger.warn("解析乐天商品数据时出错: {}", e.getMessage());
                        }
                    }
                }
            } else {
                logger.error("Rakuten API 请求失败，状态码: {}", responseCode);
            }
            
        } catch (Exception e) {
            logger.error("调用乐天API时发生异常: ", e);
        }
        
        logger.info("乐天搜索完成，找到 {} 个商品", goodsList.size());
        return goodsList;
    }
    
    /**
     * 从图片URL数组中提取第一张图片
     */
    private String extractImageUrl(com.alibaba.fastjson2.JSONArray imageUrls) {
        try {
            if (imageUrls != null && imageUrls.size() > 0) {
                JSONObject firstImage = imageUrls.getJSONObject(0);
                return firstImage.getString("imageUrl");
            }
        } catch (Exception e) {
            logger.warn("提取图片URL时出错: {}", e.getMessage());
        }
        return "";
    }
}