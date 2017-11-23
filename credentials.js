module.exports = {
    cookieSecret: '把你的cookie 秘钥放在这里',
    QQMail: {
        user: '494951309@qq.com',
        //邮箱 设置 账户 启用POP3/SMTP
        password:'itfvnblyrffqbghg',
    },           
    mongo: {
        
        development: {
            connectionString: 'mongodb://root:12345abc@localhost:27017/admin',
        },
        production: {
            connectionString: 'mongodb://root:12345abc@localhost:27017/admin',
        },
    },
};