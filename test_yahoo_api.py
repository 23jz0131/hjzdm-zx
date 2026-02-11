#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Yahoo Shopping API 独立测试脚本
用于验证App ID是否有效及接口能否正常返回数据
"""

import os
import requests
import json
from urllib.parse import quote

def test_yahoo_api():
    # 从环境变量获取App ID
    app_id = os.getenv('YAHOO_CLIENT_ID')
    
    if not app_id:
        print("❌ 错误: 未找到环境变量 YAHOO_CLIENT_ID")
        print("请设置环境变量: set YAHOO_CLIENT_ID=your_app_id_here")
        return False
    
    print(f"✅ 找到App ID: {app_id[:10]}..." if len(app_id) > 10 else f"✅ 找到App ID: {app_id}")
    
    # 测试关键词
    keyword = "手机"
    encoded_keyword = quote(keyword, encoding='utf-8')
    
    # 构建API URL
    url = f"https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch"
    params = {
        'appid': app_id,
        'query': encoded_keyword,
        'start': 1,
        'results': 30,
        'format': 'json'
    }
    
    print(f"\n🔍 测试请求:")
    print(f"URL: {url}")
    print(f"参数: {params}")
    
    try:
        # 发送请求
        print("\n🚀 发送请求...")
        response = requests.get(url, params=params, timeout=30)
        
        print(f"📊 响应状态码: {response.status_code}")
        print(f"📏 响应大小: {len(response.content)} 字节")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print("✅ JSON解析成功")
                
                # 检查是否有错误
                if 'Error' in data:
                    print(f"❌ API返回错误: {data['Error']}")
                    return False
                
                # 检查结果
                if 'hits' in data:
                    hits_count = len(data['hits']) if data['hits'] else 0
                    print(f"✅ 成功获取 {hits_count} 个商品")
                    
                    if hits_count > 0:
                        # 显示前几个商品信息
                        print("\n📱 前3个商品预览:")
                        for i, hit in enumerate(data['hits'][:3]):
                            item = hit.get('Item', {})
                            name = item.get('Name', 'N/A')
                            price = item.get('Price', 'N/A')
                            url = item.get('Url', 'N/A')
                            print(f"  {i+1}. {name}")
                            print(f"     价格: ¥{price}")
                            print(f"     链接: {url[:50]}...")
                            print()
                    
                    return True
                else:
                    print("⚠️  响应中没有 'hits' 字段")
                    print("完整响应:", json.dumps(data, ensure_ascii=False, indent=2)[:500])
                    return False
                    
            except json.JSONDecodeError as e:
                print(f"❌ JSON解析失败: {e}")
                print("原始响应内容(前500字符):")
                print(response.text[:500])
                return False
        else:
            print(f"❌ HTTP错误: {response.status_code}")
            print("响应内容:")
            print(response.text[:500])
            return False
            
    except requests.exceptions.Timeout:
        print("❌ 请求超时")
        return False
    except requests.exceptions.RequestException as e:
        print(f"❌ 请求异常: {e}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("Yahoo Shopping API 测试工具")
    print("=" * 50)
    
    success = test_yahoo_api()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 测试成功! Yahoo API工作正常")
    else:
        print("💥 测试失败! 请检查:")
        print("  1. App ID是否正确")
        print("  2. App ID是否有购物API权限")
        print("  3. 网络连接是否正常")
        print("  4. Yahoo API服务是否可用")
    print("=" * 50)
