import { Request, Response } from 'express';
import menuService from '../services/menuService';

const getAllMenu = (req: Request, res: Response) => {
  const menus = menuService.getAllMenu();
  res.send("Get all menus");
};

const menuController = {getAllMenu};

export default menuController;
