module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
        "User", 
        {
            first_name: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
            last_name: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
            pwd: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
            token: {
                type: DataTypes.STRING,
                allowNull: true
            }
        },
        {
            timestamps: false
        }
    );

    return User;
};