import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private webReqService:  WebRequestService) { }

 /**
   * Creates list from the new list button in the task component
   * Paramter: title
   * Returns observable
   */
  createList(title: string){
    return this.webReqService.post('lists', { title });
  }

  /**
   * Gets all lists in the task view component
   * Returns observable
   */
  getLists(){
    return this.webReqService.get('lists');
  }

  /**
   * Creates task for the active list
   * Paramter: title
   * Returns observable
   */
  createTask(listId: string, title: string){
    return this.webReqService.post(`lists/${listId}/tasks`, { title });
  }

  /**
   * Gets all tasks for the  Active List
   * Returns observable
   */
  getTasks(listId: string){
    return this.webReqService.get(`lists/${listId}/tasks`);
  }

}
