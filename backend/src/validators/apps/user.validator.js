import {body, param, query} from "express-validator";
import { AvailableUserRoles } from "../../constants.js";

 const userRegisterValidator = () =>{
    return [
         body("username")
         .trim()
         .notEmpty()
         .withMessage("Username is required")
         .isLength({min: 3, max: 30})
         .withMessage("Username must be between 3 and 30 characters")
         .isLowercase()
         .withMessage("Username must be in lowercase")
         .matches("^[a-z0-9_]+$")
         .withMessage("Username can only contain lowercase letters, numbers, and underscores"),
            
            body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Invalid email address"),
            body("password")
            .notEmpty()
            .withMessage("Password is required")
            .isLength({min: 6})
            .withMessage("Password must be at least 6 characters long"),
            body("role")
            .optional()
            .isIn(AvailableUserRoles)
            .withMessage(`Role must be one of the following: ${AvailableUserRoles.join(", ")}`)

    ]
}

const userloginValidator = () =>{
    return [
        body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email address"),
        body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({min: 6})
        .withMessage("Password must be at least 6 characters long"),
    ]
}

export {userRegisterValidator, userloginValidator};