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
public class YahooShoppingApiUtil {
    
    private static final Logger logger = LoggerFactory.getLogger(YahooShoppingApiUtil.class);
    
    @Value("${yahoo.client-id:#{null}}")
    private String clientId;
    
    private static final String YAHOO_API_URL = "https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch";
    
    /**
     * 搜索Yahoo商品
     */
    public List<Goods> searchGoods(String keyword, int maxResults) {
        List<Goods> goodsList = new ArrayList<>();
        
        if (clientId == null || clientId.isEmpty()) {
            logger.warn("Yahoo API Client ID not configured");
            return goodsList;
        }
        
        try {
            String encodedKeyword = URLEncoder.encode(keyword, StandardCharsets.UTF_8.toString());
            String url = String.format("%s?appid=%s&query=%s&start=1&results=%d&format=json",
                    YAHOO_API_URL, clientId, encodedKeyword, maxResults);
            
            logger.info("Yahoo API 请求URL: {}", url);
            
            HttpsURLConnection connection = (HttpsURLConnection) new java.net.URL(url).openConnection();
            connection.setRequestMethod("GET");
            connection.setRequestProperty("User-Agent", "Mozilla/5.0");
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(15000);
            
            int responseCode = connection.getResponseCode();
            logger.info("Yahoo API 响应状态码: {}", responseCode);
            
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
                logger.info("Yahoo API 响应长度: {} 字符", jsonResponse.length());
                
                // 解析JSON响应
                JSONObject jsonObject = JSON.parseObject(jsonResponse);
                
                if (jsonObject.containsKey("Error")) {
                    logger.error("Yahoo API 错误: {}", jsonObject.getJSONObject("Error").getString("Message"));
                    return goodsList;
                }
                
                if (jsonObject.containsKey("hits")) {
                    com.alibaba.fastjson2.JSONArray hitsArray = jsonObject.getJSONArray("hits");
                    logger.info("Yahoo API 返回商品数: {}", hitsArray.size());
                    
                    for (int i = 0; i < hitsArray.size() && goodsList.size() < maxResults; i++) {
                        try {
                            JSONObject hit = hitsArray.getJSONObject(i);
                            
                            // 检查必要字段（直接在hit层级）
                            if (hit.getString("name") != null && 
                                hit.getString("url") != null && 
                                hit.getString("price") != null) {
                                
                                Goods goods = new Goods();
                                goods.setGoodsName(hit.getString("name"));
                                goods.setGoodsPrice(Double.parseDouble(hit.getString("price")));
                                goods.setGoodsLink(hit.getString("url"));
                                
                                // 正确处理图片URL - Yahoo API返回的是对象格式
                                String imgUrl = "";
                                if (hit.containsKey("image")) {
                                    Object imageObj = hit.get("image");
                                    if (imageObj instanceof JSONObject) {
                                        // image是JSONObject对象，包含small和medium字段
                                        JSONObject imageJson = (JSONObject) imageObj;
                                        imgUrl = imageJson.getString("medium") != null ? 
                                                imageJson.getString("medium") : 
                                                (imageJson.getString("small") != null ? 
                                                    imageJson.getString("small") : "");
                                    } else if (imageObj instanceof String) {
                                        // 如果是字符串格式
                                        imgUrl = (String) imageObj;
                                    }
                                }
                                goods.setImgUrl(imgUrl);
                                
                                goods.setMallType(20); // Yahoo平台标识
                                
                                // 设置其他字段
                                goods.setGoodsId(System.currentTimeMillis() + i);
                                goods.setCreateTime(new java.util.Date());
                                
                                goodsList.add(goods);
                                logger.debug("添加Yahoo商品: {} - ¥{}", 
                                    goods.getGoodsName(), goods.getGoodsPrice());
                            }
                        } catch (Exception e) {
                            logger.warn("解析Yahoo商品数据时出错: {}", e.getMessage());
                        }
                    }
                }
            } else {
                logger.error("Yahoo API 请求失败，状态码: {}", responseCode);
            }
            
        } catch (Exception e) {
            logger.error("调用Yahoo API时发生异常: ", e);
        }
        
        logger.info("Yahoo搜索完成，找到 {} 个商品", goodsList.size());
        return goodsList;
    }
}