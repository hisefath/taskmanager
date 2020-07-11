import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';
import { Task } from './models/task.model';

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
   * Updates active list title
   * Paramter: title
   * Returns observable
   */
  updateList(id: string, title: string) {
    // We want to send a web request to update a list
    return this.webReqService.patch(`lists/${id}`, { title });
  }

    /**
   * Updates task
   * Paramter: title
   * Returns observable
   */
  updateTask(listId: string, taskId: string, title: string) {
    // We want to send a web request to update a list
    return this.webReqService.patch(`lists/${listId}/tasks/${taskId}`, { title });
  }

  /**
   * Deletes task for the active list
   * Paramter: title
   * Returns observable
   */
  deleteTask(listId: string, taskId: string) {
    return this.webReqService.delete(`lists/${listId}/tasks/${taskId}`);
  }

  /**
   * Deletes active list
   * Paramter: title
   * Returns observable
   */
  deleteList(id: string) {
    return this.webReqService.delete(`lists/${id}`);
  }

  /**
   * Gets all tasks for the  Active List
   * Returns observable
   */
  getTasks(listId: string){
    return this.webReqService.get(`lists/${listId}/tasks`);
  }

  /**
   * Updates task as completed
   * Returns Observable
   */
  complete(task: Task){
    return this.webReqService.patch(`lists/${task._listId}/tasks/${task._id}`, {completed: !task.completed});
  }

}