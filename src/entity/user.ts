import { hash, compare } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Index, 
    Column, 
    CreateDateColumn, 
    UpdateDateColumn, 
    DeleteDateColumn 
} from "typeorm";

import Database from "../utils/database";
import Result from "../model/result";



@Entity("users") 
export default class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Index({ unique: true })
    @Column({ type: "uuid", unique: true, nullable: false })
    ukey: string;

    @Index({ unique: true })
    @Column({ length: 50, unique: true, nullable: false })
    email: string;

    @Column({ length: 100, nullable: false })
    password: string;

    @Column({ nullable: false, default: false })
    confirmed: boolean;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;

    @DeleteDateColumn({ name: "deleted_at" })
    deletedAt?: Date;

    constructor(email: string, password: string) {
        this.id = 0;
        this.ukey = "";
        this.email = email;
        this.password = password;
        this.confirmed = false;
        this.createdAt = new Date();
        this.updatedAt  = new Date();
    }

    static async getByUserKey(ukey: string): Promise<User | undefined> {
        const db = new Database<User>(User);
        return await db.get({ ukey });
    }

    static async getByUserEmail(email: string): Promise<User | undefined> {
        const db = new Database<User>(User);
        return await db.get({ email });
    }

    async save(): Promise<boolean> {
        const db = new Database<User>(User);
        return await db.save(this);
    }

    static async register(email: string, password: string, confirmation: string): Promise<Result<User>> {
        if(password != confirmation) {
            return new Result<User>(new Error("Password do not match"), 400);
        }

        const user = await User.getByUserEmail(email);
        if(user != undefined) {
            return new Result<User>(new Error("User exists"), 400);
        }

        try {
            const hashedPassword = await hash(password, 12);
            const user = new User(email, hashedPassword);
            user.ukey = uuidv4();
            if(await user.save()) {
                return new Result<User>(user, 201);
            } else {
                return new Result<User>(new Error("Registration failed"), 500);
            }

        } catch (error) {
            console.log(error);
            return new Result<User>(new Error("Registration failed"), 500);
        };
    }

    static async login(email: string, password: string) {
        const user = await User.getByUserEmail(email);
        if(user == undefined) {
            return new Result<any>(new Error("Invalid credentials"), 400);
        }

        if(!user.confirmed) {
            return new Result<any>(new Error("User not confirmed"), 401);
        }

        try {
            const isValid = await compare(password, user.password);
            if(isValid) {
                const accessToken = `access-token-${user.ukey}`;
                return new Result<any>({ ukey: user.ukey, accessToken: accessToken}, 200);
            } else {
                return new Result<any>(new Error("Invalid credentials"), 400);
            }
        } catch (error) {
            console.log(error);
            return  new Result<any>(new Error("Login failed"), 500);
        }
    }
}

