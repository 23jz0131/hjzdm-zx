import requests
import json

# 测试后端的商品比较接口
url = "http://localhost:9090/goods/compare"
headers = {
    "Content-Type": "application/json"
}
data = {
    "keyword": "手机",
    "page": 1
}

print("发送商品比较请求...")
response = requests.post(url, headers=headers, json=data)

print(f"状态码: {response.status_code}")
print(f"响应内容: {response.text}")

if response.status_code == 200:
    result = response.json()
    print(f"返回的商品数量: {len(result.get('goodsList', []))}")
    # 检查是否有雅虎来源的商品
    yahoo_goods = [g for g in result.get('goodsList', []) if g.get('source') == 'yahoo']
    print(f"雅虎商品数量: {len(yahoo_goods)}")
    if yahoo_goods:
        print("雅虎商品示例:")
        for i, goods in enumerate(yahoo_goods[:3]):
            print(f"  {i+1}. {goods.get('goodsName')} - ¥{goods.get('goodsPrice')} - {goods.get('source')}")
    else:
        print("没有找到雅虎来源的商品!")
else:
    print("请求失败!")
