# 类图 (クラス図)

## 前端类结构

```mermaid
classDiagram
    class App {
        +state: any
        +render()
    }
    
    class Header {
        +state: {isLoggedIn: boolean, username: string, isAdmin: boolean}
        +syncAuthState()
        +handleLogout()
        +render()
    }
    
    class Footer {
        +render()
    }
    
    class ProtectedRoute {
        +children: JSX.Element
        +render()
    }
    
    class UserSidebar {
        +state: {activeTab: string}
        +render()
    }
    
    class Home {
        +state: {products: Product[], loading: boolean, searchQuery: string}
        +handleSearch()
        +render()
    }
    
    class ComparePage {
        +state: {products: Product[], query: string, loading: boolean, error: string}
        +handleSearch()
        +render()
    }
    
    class ProfilePage {
        +state: {profile: UserProfile, loading: boolean}
        +loadProfile()
        +updateProfile()
        +render()
    }
    
    class MyCollectionPage {
        +state: {products: Product[], loading: boolean}
        +loadCollections()
        +removeFromCollection()
        +render()
    }
    
    class BrowseHistoryPage {
        +state: {products: Product[], loading: boolean, error: string}
        +loadHistory()
        +render()
    }
    
    class MyTipPage {
        +state: {disclosures: Disclosure[], loading: boolean, showForm: boolean}
        +loadDisclosures()
        +handleSubmit()
        +render()
    }
    
    class CommunityPage {
        +state: {disclosures: Disclosure[], loading: boolean}
        +loadDisclosures()
        +render()
    }
    
    class AdminDisclosurePage {
        +state: {activeTab: string, items: Disclosure[], loading: boolean}
        +load()
        +audit()
        +render()
    }
    
    class NotificationPage {
        +state: {list: Notification[], loading: boolean}
        +load()
        +handleRead()
        +render()
    }
    
    class LoginPage {
        +state: {username: string, password: string}
        +handleLogin()
        +render()
    }
    
    class RegisterPage {
        +state: {username: string, password: string, confirmPassword: string}
        +handleRegister()
        +render()
    }
    
    class ProfileSetupPage {
        +state: {nickname: string, avatar: string}
        +handleSave()
        +render()
    }
    
    class SubmitDisclosurePage {
        +state: {formData: FormData, loading: boolean}
        +handleInputChange()
        +handleSubmit()
        +render()
    }
    
    class ApiServices {
        +login(credentials)
        +register(userData)
        +getGoods(query)
        +getUserProfile()
        +updateUserProfile(profile)
        +getDisclosureList()
        +submitDisclosure(data)
    }
    
    class WebSocketService {
        +connect()
        +disconnect()
        +sendMessage()
        +onMessage(callback)
    }
    
    %% 关系定义
    App ||--|| Header : "使用"
    App ||--|| Footer : "使用"
    App ||--|| ProtectedRoute : "使用"
    ProtectedRoute ||--o{ Home : "渲染"
    ProtectedRoute ||--o{ ComparePage : "渲染"
    ProtectedRoute ||--o{ ProfilePage : "渲染"
    ProtectedRoute ||--o{ MyCollectionPage : "渲染"
    ProtectedRoute ||--o{ BrowseHistoryPage : "使用"
    ProtectedRoute ||--o{ MyTipPage : "使用"
    ProtectedRoute ||--o{ CommunityPage : "使用"
    ProtectedRoute ||--o{ AdminDisclosurePage : "使用"
    ProtectedRoute ||--o{ NotificationPage : "使用"
    Header ||--|| UserSidebar : "使用"
    Header ||--|| ProtectedRoute : "使用"
    Home ||--|| ApiServices : "调用"
    ComparePage ||--|| ApiServices : "调用"
    ProfilePage ||--|| ApiServices : "调用"
    MyCollectionPage ||--|| ApiServices : "调用"
    BrowseHistoryPage ||--|| ApiServices : "调用"
    MyTipPage ||--|| ApiServices : "调用"
    CommunityPage ||--|| ApiServices : "调用"
    AdminDisclosurePage ||--|| ApiServices : "调用"
    NotificationPage ||--|| ApiServices : "调用"
    LoginPage ||--|| ApiServices : "调用"
    RegisterPage ||--|| ApiServices : "调用"
    ProfileSetupPage ||--|| ApiServices : "调用"
    SubmitDisclosurePage ||--|| ApiServices : "调用"
    ApiServices ||--|| WebSocketService : "使用"
```

## 后端类结构

```mermaid
classDiagram
    class UserController {
        +login(LoginDTO)
        +register(RegisterDTO)
        +getProfile()
        +updateProfile(ProfileDTO)
        +getHistory()
        +addHistory()
        +clearHistory()
    }
    
    class GoodsController {
        +searchGoods(SearchDTO)
        +compareGoods(SearchDTO)
        +getGoodsDetail(id)
        +likeGoods(LikeDTO)
        +collectGoods(CollectDTO)
        +getMyCollections()
    }
    
    class DisclosureController {
        +getDisclosureList()
        +getDisclosureDetail(id)
        +submitDisclosure(DisclosureDTO)
        +auditDisclosure(AuditDTO)
        +getMyDisclosure()
    }
    
    class CommentController {
        +addComment(CommentDTO)
        +replyComment(ReplyDTO)
        +deleteComment(id)
        +getCommentsByDisclosure(disclosureId)
    }
    
    class CategoryController {
        +getList()
        +getAttributes(catId)
    }
    
    class NotificationController {
        +getMyNotifications()
        +markAsRead(notificationId)
        +markAllAsRead()
    }
    
    class UserService {
        +login(LoginDTO)
        +register(RegisterDTO)
        +updateProfile(ProfileDTO)
        +getUserProfile(userId)
    }
    
    class GoodsService {
        +searchGoods(SearchDTO)
        +compareGoods(SearchDTO)
        +add(Goods)
        +queryGoods(QueryDTO)
        +likeGoods(LikeDTO)
        +collectGoods(CollectDTO)
    }
    
    class DisclosureService {
        +getDisclosureList(PageDTO)
        +submitDisclosure(DisclosureDTO)
        +auditDisclosure(AuditDTO)
        +getMyDisclosure(userId)
    }
    
    class CommentService {
        +addComment(CommentDTO)
        +replyComment(ReplyDTO)
        +deleteComment(commentId)
        +getCommentsByDisclosure(disclosureId)
    }
    
    class CategoryService {
        +getList()
        +getAttributes(catId)
    }
    
    class NotificationService {
        +getMyNotifications(userId)
        +markAsRead(notificationId)
        +markAllAsRead(userId)
        +sendNotification(Notification)
    }
    
    class UserMapper {
        +selectById(id)
        +insert(user)
        +updateById(user)
    }
    
    class GoodsMapper {
        +selectById(id)
        +insert(goods)
        +selectByCondition(condition)
        +queryBrowseHistory(userId)
    }
    
    class DisclosureMapper {
        +selectById(id)
        +insert(disclosure)
        +selectByCondition(condition)
    }
    
    class CommentMapper {
        +selectById(id)
        +insert(comment)
        +selectByDisclosureId(disclosureId)
    }
    
    class CategoryMapper {
        +selectById(id)
        +selectAll()
    }
    
    class NotificationMapper {
        +selectById(id)
        +insert(notification)
        +selectByUserId(userId)
    }
    
    class User {
        -id: Long
        -username: String
        -password: String
        -email: String
        -nickname: String
        -avatar: String
        -createTime: Date
    }
    
    class Goods {
        -id: Long
        -goodsName: String
        -goodsPrice: Double
        -goodsLink: String
        -imgUrl: String
        -mallType: Integer
        -createTime: Date
        -catId: Long
        -author: Long
    }
    
    class Disclosure {
        -disclosureId: Long
        -title: String
        -content: String
        -link: String
        -disclosurePrice: Double
        -imgUrl: String
        -createTime: String
        -status: Integer
        -author: Long
    }
    
    class Comment {
        -commentId: Long
        -disclosureId: Long
        -content: String
        -parentId: Long
        -createTime: Date
        -author: Long
    }
    
    class Category {
        -id: Long
        -name: String
        -parentId: Long
        -level: Integer
    }
    
    class Notification {
        -id: Long
        -title: String
        -content: String
        -isRead: Integer
        -createTime: Date
        -receiverId: Long
    }
    
    class GoodsLike {
        -id: Long
        -userId: Long
        -goodsId: Long
        -status: Integer
    }
    
    class GoodsCollect {
        -id: Long
        -userId: Long
        -goodsId: Long
        -status: Integer
    }
    
    class UserBrowseHistory {
        -id: Long
        -userId: Long
        -goodsId: Long
        -browseTime: Date
    }
    
    %% 关系定义
    UserController ||--|| UserService : "使用"
    GoodsController ||--|| GoodsService : "使用"
    DisclosureController ||--|| DisclosureService : "使用"
    CommentController ||--|| CommentService : "使用"
    CategoryController ||--|| CategoryService : "使用"
    NotificationController ||--|| NotificationService : "使用"
    
    UserService ||--|| UserMapper : "使用"
    GoodsService ||--|| GoodsMapper : "使用"
    DisclosureService ||--|| DisclosureMapper : "使用"
    CommentService ||--|| CommentMapper : "使用"
    CategoryService ||--|| CategoryMapper : "使用"
    NotificationService ||--|| NotificationMapper : "使用"
    
    UserService ||--|| User : "操作"
    GoodsService ||--|| Goods : "操作"
    DisclosureService ||--|| Disclosure : "操作"
    CommentService ||--|| Comment : "操作"
    CategoryService ||--|| Category : "操作"
    NotificationService ||--|| Notification : "操作"
    GoodsService ||--|| GoodsLike : "操作"
    GoodsService ||--|| GoodsCollect : "操作"
    UserService ||--|| UserBrowseHistory : "操作"
    
    UserController ..> LoginDTO : "接收"
    UserController ..> RegisterDTO : "接收"
    UserController ..> ProfileDTO : "接收"
    GoodsController ..> SearchDTO : "接收"
    GoodsController ..> LikeDTO : "接收"
    GoodsController ..> CollectDTO : "接收"
    DisclosureController ..> DisclosureDTO : "接收"
    DisclosureController ..> AuditDTO : "接收"
    CommentController ..> CommentDTO : "接收"
    CommentController ..> ReplyDTO : "接收"
```