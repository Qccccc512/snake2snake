import User from '../core/User.js';

/**
 * 用户管理器（单例模式）
 * 负责用户的创建、删除、保存和加载
 */
class UserManager {
    static instance = null;

    constructor() {
        if (UserManager.instance) {
            return UserManager.instance;
        }

        this.users = new Map(); // userId => User
        this.storageKey = 'snake_game_users';
        this.loadAllUsers();

        UserManager.instance = this;
    }

    static getInstance() {
        if (!UserManager.instance) {
            UserManager.instance = new UserManager();
        }
        return UserManager.instance;
    }

    /**
     * 创建新用户
     * @param {string} userName - 用户名
     * @returns {User} 创建的用户
     */
    createUser(userName) {
        // 检查用户名是否已存在
        for (const user of this.users.values()) {
            if (user.userName === userName) {
                throw new Error('用户名已存在');
            }
        }

        const user = new User(userName);
        this.users.set(user.userId, user);
        this.saveAllUsers();
        return user;
    }

    /**
     * 获取用户
     * @param {string} userId - 用户ID
     * @returns {User|null}
     */
    getUser(userId) {
        return this.users.get(userId) || null;
    }

    /**
     * 删除用户
     * @param {string} userId - 用户ID
     * @returns {boolean} 是否删除成功
     */
    deleteUser(userId) {
        const deleted = this.users.delete(userId);
        if (deleted) {
            this.saveAllUsers();
        }
        return deleted;
    }

    /**
     * 获取所有用户
     * @returns {User[]}
     */
    getAllUsers() {
        return Array.from(this.users.values());
    }

    /**
     * 获取所有用户的摘要信息
     * @returns {object[]}
     */
    getAllUserSummaries() {
        return this.getAllUsers()
            .map(user => user.getSummary())
            .sort((a, b) => new Date(b.lastPlayedAt) - new Date(a.lastPlayedAt));
    }

    /**
     * 保存用户数据
     * @param {User} user - 要保存的用户
     */
    saveUserData(user) {
        if (this.users.has(user.userId)) {
            this.saveAllUsers();
        }
    }

    /**
     * 保存所有用户到本地存储
     */
    saveAllUsers() {
        try {
            const usersData = Array.from(this.users.values()).map(user => user.serialize());
            localStorage.setItem(this.storageKey, JSON.stringify(usersData));
        } catch (error) {
            console.error('Failed to save users:', error);
        }
    }

    /**
     * 从本地存储加载所有用户
     */
    loadAllUsers() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                const usersData = JSON.parse(data);
                this.users.clear();
                
                for (const userData of usersData) {
                    const user = User.deserialize(userData);
                    this.users.set(user.userId, user);
                }
            }
        } catch (error) {
            console.error('Failed to load users:', error);
            this.users.clear();
        }
    }

    /**
     * 获取用户数量
     * @returns {number}
     */
    getUserCount() {
        return this.users.size;
    }

    /**
     * 检查用户名是否可用
     * @param {string} userName - 用户名
     * @returns {boolean}
     */
    isUserNameAvailable(userName) {
        for (const user of this.users.values()) {
            if (user.userName === userName) {
                return false;
            }
        }
        return true;
    }

    /**
     * 导出所有用户数据（用于备份）
     * @returns {string} JSON字符串
     */
    exportAllUsers() {
        const usersData = Array.from(this.users.values()).map(user => user.serialize());
        return JSON.stringify(usersData, null, 2);
    }

    /**
     * 导入用户数据（用于恢复）
     * @param {string} jsonData - JSON字符串
     * @returns {boolean} 是否导入成功
     */
    importUsers(jsonData) {
        try {
            const usersData = JSON.parse(jsonData);
            if (!Array.isArray(usersData)) {
                throw new Error('Invalid data format');
            }

            for (const userData of usersData) {
                const user = User.deserialize(userData);
                this.users.set(user.userId, user);
            }

            this.saveAllUsers();
            return true;
        } catch (error) {
            console.error('Failed to import users:', error);
            return false;
        }
    }

    /**
     * 清空所有用户数据（危险操作）
     */
    clearAllUsers() {
        this.users.clear();
        localStorage.removeItem(this.storageKey);
    }
}

export default UserManager;

