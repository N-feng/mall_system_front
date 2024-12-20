import Taro, { redirectTo, showToast } from '@tarojs/taro';

export const formatNumber = (num) => {
  if (!num) {
    num = 0;
  }
  num = Number(num)
  return num.toLocaleString('en-US',
    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  );
}

export const removeEmptyProperties = (obj) => {
  return Object.entries(obj)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .reduce(
      (newObj, [key, value]) => ({
        ...newObj,
        [key]: value,
      }),
      {}
    );
}


export const handleRedirectToLogin = () => {
  showToast({ title: "登录状态过期", icon: "error", duration: 2000 });
  redirectTo({
    url: "/pages/login/index",
  });
}

/* eslint-disable */
export const genTextData = (keyPrefix) => {
  return [
    'This is an text.',
    'This is a looooooooooooooooooong text.',
    '基于有赞 VantWeapp 开发的同时支持 Taro 和 React 的 UI 库',
    '短文本',
    '数据源必须包含key字段，.',
    'This is a loooooooooooooooooooooooooooooooong text.',
    'This is a loooooooooooooooooooooooooooooooong text.',
  ].map((content, index) => {
    return {
      key: keyPrefix + index,
      content,
    }
  })
}
export const mockGoods = () => {
  const initData = [
    {
      image: 'https://img.yzcdn.cn/vant/cat.jpeg',
      title:
        '中老年羽绒服男冬季爸爸装薄短款白鸭绒中年人男士保暖外套男装 夜空黑 L【建议115斤以内】',
      price: '¥165.00',
    },
    {
      image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg',
      title: 'HLA海澜之家马丁靴男士高帮男靴复古工装鞋',
      price: '¥361.00',
    },
    {
      image: 'https://img.yzcdn.cn/upload_files/2017/07/02/af5b9f44deaeb68000d7e4a711160c53.jpg',
      title:
        '洁丽雅拖鞋男夏浴室洗澡防滑家居室内EVA大码男士凉拖鞋居家用夏季防臭 灰色 41-42【标准码】',
      price: '¥22.50',
    },
    {
      image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpeg',
      title: '夏季新款男士T恤宽松气质高端百搭时尚短袖体恤潮牌',
      price: '¥212.00',
    },{
      image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg',
      title: '夏季新款男士T恤宽松气质高端百搭时尚短袖体恤潮牌',
      price: '¥212.00',
    },{
      image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-4.jpeg',
      title: '夏季新款男士T恤宽松气质高端百搭时尚短袖体恤潮牌',
      price: '¥212.00',
    },{
      image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-5.jpeg',
      title: '夏季新款男士T恤宽松气质高端百搭时尚短袖体恤潮牌',
      price: '¥212.00',
    },{
      image: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-6.jpeg',
      title: '夏季新款男士T恤宽松气质高端百搭时尚短袖体恤潮牌',
      price: '¥212.00',
    },
  ]
  return new Array(10).fill('').map((_, index) => {
    return {
      key: index,
      ...initData[index % 4],
      isCutPrice: index % 2 === 0 ? true : false,
    }
  })
}
/* eslint-disable */
export const sku = [
  {
    id: 1,
    name: '颜色',
    items: [
      {
        name: '亮黑色',
        id: 11,
        color: '#131111',
        // 自定义属性...
      },
      {
        name: '釉白色',
        id: 12,
        mark: '首发',
        color: '#ffff',
      },
      {
        name: '秘银色',
        id: 13,
        color: '#d2cccc',
      },
      {
        name: '夏日胡杨',
        id: 14,
        color: '#dd5151',
      },
    ],
  },
  {
    id: 2,
    name: '版本',
    items: [
      {
        name: '8GB+128GB',
        id: 21,
      },
      {
        name: '8GB+256GB',
        id: 22,
      },
    ],
  },
]
export const goodsList = [
  {
    id: 1,
    skuIds: [11, 21], // 可以无序
    skuName: '亮黑色&8GB+128GB', // 自定义属性
    // 自定义属性...
  },
  {
    id: 2,
    skuIds: [11, 22],
    skuName: '亮黑色&8GB+256GB',
    count: 0, // 自定义属性
  },
  {
    id: 3,
    skuIds: [12, 21],
    skuName: '釉白色&8GB+128GB',
  },
  {
    id: 4,
    skuIds: [12, 22],
    skuName: '釉白色&8GB+256GB',
  },
  {
    id: 4,
    skuIds: [21, 13],
    skuName: '秘银色&8GB+128GB',
  },
  {
    id: 6,
    skuIds: [13, 22],
    skuName: '秘银色&8GB+256GB',
    disabled: true, // 无法选择的商品
  },
  {
    id: 7,
    skuIds: [14, 22],
    skuName: '夏日胡杨&8GB+256GB',
  },
]
export function resolveAfter2Seconds() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        total_pages: 10,
        results: [{process_id: Math.random().toString()}],
        current_page: 1,
      });
    }, 500);
  });
}
export const mockImages = [
  'https://img.yzcdn.cn/vant/cat.jpeg',
  'https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg',
  'https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpeg',
  'https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg',
  'https://fastly.jsdelivr.net/npm/@vant/assets/apple-4.jpeg',
  'https://fastly.jsdelivr.net/npm/@vant/assets/apple-5.jpeg',
  'https://fastly.jsdelivr.net/npm/@vant/assets/apple-6.jpeg',
  'https://img.yzcdn.cn/upload_files/2017/07/02/af5b9f44deaeb68000d7e4a711160c53.jpg',
]
/*('pending', '待确认'),
('to_be_shipped', '待发货'),
('to_be_received', '待收货'),
('to_be_paid', '待还款'),
('completed', '已完成'),
('canceled', '已取消')
用户订单表*/
export const userTabList = [
  { title:"待确认",name:"pending", icon: 'balance-list-o'},
  { title:"待发货",name:"to_be_shipped", icon: 'calendar-o'},
  { title:"待收货",name:"to_be_received", icon: 'goods-collect-o'},
  { title:"待还款",name:"to_be_paid", icon: 'balance-o'},
  { title:"已完成",name:"completed", icon: 'points'},
  {title:"已取消",name:"canceled", icon: 'revoke'},
  { title:"全部",name:"all", icon: 'desktop-o'},
]
/*('pending', '待确认'),
('to_be_shipped', '待发货'),
('to_be_received', '待确认收货'),
('to_be_paid', '待收款'),
('completed', '已完成'),
('canceled', '已取消'),
商品订单表*/
export const sellerTabList = [
  {title:"待确认",name:"pending", icon: 'balance-list-o'},
  {title:"待发货",name:"to_be_shipped", icon: 'calendar-o'},
  {title:"待确认收货",name:"to_be_received", icon: 'goods-collect-o'},
  {title:"待收款",name:"to_be_paid", icon: 'balance-o'},
  {title:"已完成",name:"completed", icon: 'points'},
  {title:"已取消",name:"canceled", icon: 'revoke'},
  {title:"全部",name:"all", icon: 'desktop-o'},
]
