import { track, api , wire} from 'lwc';
import { lwx, LWXLightningElement  } from 'c/lxutil';
import CREATENEWFOLDER from "@salesforce/apex/TP_articleOperations.createNewFolder";

import staticImages from "@salesforce/resourceUrl/TP_uiImages";

export default class TpCreateArticleFolder extends LWXLightningElement {
                 closePopupImage = staticImages + "/images/Close@2x.png";
                 modalObject;
                 @track folderNameValue = "";
                 @track user;
                 @track rootStore;
                 @api editFolderDesc;
                 @api editFolderName;
                 @track invalidFeedback;
                 @api formInfo;
                 @track errorSuccessData = { isSuccess: false, messages: [] };

                 //Getting User information from the rootStore
                 connectedCallback() {
                   this.rootStore = new lwx("_rootstore");
                   this.rootStore.connect(
                     {
                       user: "user",
                       applicationSettings: "applicationSettings"
                     },
                     this._LWXgetset
                   );
                 }

                 renderedCallback() {
                   this.modalObject = this.template.querySelector(
                     ".toggle-modal"
                   );
                   //console.log(JSON.stringify(this.formInfo));
                   
                 }

                 closeCreateFolderPopup(data) {
                   let entData = data ? data : "";
                   this.dispatchEvent(
                     new CustomEvent("closecreatefolderpopup", { detail: entData })
                   );
                 }

                 checkOpacityClick(event) {
                  event.stopPropagation(); 
                   if (event.target == this.modalObject) {
                     this.closeCreateFolderPopup("");
                   }
                 }

                 //calling apex controller for saving the data
                 createNewFolder(event) {
                  event.stopPropagation();
                   this.editFolderDesc = this.template.querySelector(
                     '[name="desc"]'
                   ).value;9
                   this.folderNameValue = this.template.querySelector(
                     '[name="input"]'
                   ).value;
                   this.editFolderName = this.folderNameValue;

                   if (!this.folderNameValue) {
                     this.invalidFeedback = "Please enter a folder name.";
                     this.template.querySelector(
                       '[class="invalid-feedback"]'
                     ).style.display = "block";
                   } else {
                     if (
                       this.formInfo.folderNameInfo.some(
                         (item) =>
                           item.Name.toLowerCase() ===
                           this.folderNameValue.toLowerCase()
                       ) &&
                       this.formInfo.actionMode === "create"
                     ) {
                       this.invalidFeedback =
                         "Folder with same name already exist!";
                       this.template.querySelector(
                         '[class="invalid-feedback"]'
                       ).style.display = "block";
                       return false;
                     } else if (this.formInfo.actionMode === "edit") {
                       for (
                         let index = 0;
                         index < this.formInfo.folderNameInfo.length;
                         index++
                       ) {
                         if (
                           this.formInfo.editFolderId !=
                             this.formInfo.folderNameInfo[index].Key &&
                           this.editFolderName ==
                             this.formInfo.folderNameInfo[index].Name
                         ) {
                           this.invalidFeedback =
                             "Folder with same name already exist!";
                           this.template.querySelector(
                             '[class="invalid-feedback"]'
                           ).style.display = "block";
                           return false; } 
                       }

                     } 
                     let data = event.target ? event.target.dataset.id : event.currentTarget.dataset.id;
                    this.createArticleFold(data);
                       
                     
                   }
                 }

                 createArticleFold(data) {
                   CREATENEWFOLDER({
                     fldrName: this.folderNameValue,
                     usId: this.user.detail.Id,
                     folId: this.formInfo.editFolderId,
                     description: this.editFolderDesc
                   })
                     .then((result) => {
                       this.errorSuccessData.messages = [];
                       if (result == true) {
                         let message = "Folder has been created successfully.";
                         if(this.formInfo.editFolderId)
                         {
                            message = "Folder has been updated successfully.";
                         }
                         this.errorSuccessData.isSuccess = true;
                         this.errorSuccessData.messages.push(
                            message
                         );
                       } else {
                        let message = "Unable to create the folder.";
                        if(this.formInfo.editFolderId)
                        {
                           message = "Unable to update the folder.";
                        }
                         this.errorSuccessData.isSuccess = false;
                         this.errorSuccessData.messages.push(message);
                       }
                       this.rootStore
                         .getconnector()
                         .dispatch("showErrorSuccess", this.errorSuccessData);
                       this.closeCreateFolderPopup(data);
                     })
                     .catch((error) => {
                       console.log("error::" + JSON.stringify(error));
                     });
                 }
               }