import { lwx, LWXLightningElement } from "c/lxutil";
import { track, api } from "lwc";
import { NavigationMixin } from 'lightning/navigation';
import staticImages from '@salesforce/resourceUrl/TP_uiImages';

import createCustomPushNotification from '@salesforce/apex/TP_customPushNotification.createCustomPushNotification';
import pushNotificationDetails from '@salesforce/apex/TP_customPushNotification.pushNotificationDetails';
import getCustomMetadata from '@salesforce/apex/TP_customPushNotification.getCustomMetadata';
import getPicklistvalues from "@salesforce/apex/TP_customPushNotification.getPicklistvalues";
import getContentGroup from "@salesforce/apex/TP_customPushNotification.getContentGroup";
import Franchise from "@salesforce/apex/TP_customPushNotification.getAllFranchise";
import FranchiseRole from "@salesforce/apex/TP_customPushNotification.getFranchiseRole";
import userArticleBadgeDetails from "@salesforce/apex/TP_customPushNotification.userArticleBadgeDetails";
import getAllThumbnailImages from '@salesforce/apex/TP_createArticle.getAllThumbnailImages';
import TP_CreateSucessMsg from "@salesforce/label/c.TP_CreateSucessMsg";
import archivedays from '@salesforce/label/c.TP_archiveDays';
import franchiseTooltip from "@salesforce/label/c.TP_franchiseTooltip";
import productTmTooltip from "@salesforce/label/c.TP_productTmTooltip";
import stateTooltip from "@salesforce/label/c.TP_stateTooltip";
import cityTooltip from "@salesforce/label/c.TP_cityTooltip";
import zipTooltip from "@salesforce/label/c.TP_zipTooltip";
import roleTooltip from "@salesforce/label/c.TP_roleTooltip";
import addRoleTooltip from "@salesforce/label/c.TP_addRoleTooltip";
import thumbnailImageTooltip from "@salesforce/label/c.TP_thumbnailImageTooltip";
import publishTooltip from "@salesforce/label/c.TP_publishTooltip";
import previewTooltip from "@salesforce/label/c.TP_previewArticle";
import TP_CreateErrorMessage from "@salesforce/label/c.TP_CreateErrorMessage";
import TP_thumbnailSizeErrorMessage from "@salesforce/label/c.TP_thumbnailSizeErrorMessage";
import TP_thumbnailInsertErrorMessage from "@salesforce/label/c.TP_thumbnailInsertErrorMessage";
import TP_updateSuccessMessage from "@salesforce/label/c.TP_updateSuccessMessage";
import TP_unpublishSuccessMessage from "@salesforce/label/c.TP_unpublishSuccessMessage";
import TP_thumbnailFileSize from "@salesforce/label/c.TP_thumbnailFileSize";
import TP_updateErrorMsg from "@salesforce/label/c.TP_updateErrorMsg";
import TP_autoSaveTime from "@salesforce/label/c.TP_autoSaveTime";
import TP_AutoSaveSucessMsg from "@salesforce/label/c.TP_AutoSaveSucessMsg";
import TP_AutoSaveInitiateMsg from "@salesforce/label/c.TP_AutoSaveInitiateMsg";
import TP_AutoSaveErrorMsg from "@salesforce/label/c.TP_AutoSaveErrorMsg";
import TP_AutoSaveExitTime from "@salesforce/label/c.TP_AutoSaveExitTime";
import Tp_UnpublishArticleMsg from "@salesforce/label/c.Tp_UnpublishArticleMsg";
import openAICall from '@salesforce/apex/AzureOpenAI_integ.callOpenAI';
import repRoasterDetails from '@salesforce/apex/geoTargetingController.getRepRoasterDetails';
import getStates from '@salesforce/apex/geoTargetingController.getStates';
import getCities from '@salesforce/apex/geoTargetingController.getCities';
import getRegions from '@salesforce/apex/geoTargetingController.getRegions';
import getFranchiseRegions from '@salesforce/apex/Tp_FranchiseLogic.getFranchiseRegions';

const notificationObjectDetails = { apiName: 'TP_Push_Notification_abv__c', fields: { categories: 'Category_abv__c', contentGroup: 'ContentGroup_abv__c', audiences: 'Audience_abv__c' } };

export default class TpCustomCreatePushNotification extends NavigationMixin(LWXLightningElement) {


    downArrowImage = staticImages + "/images/drop_arrow-search.png";
    feedimg = staticImages + "/images/feedimg.png";
    uploadedCloseImage = staticImages + "/images/Remove.png";
    arrowDownDownImage = staticImages + "/images/arrow_drop_down.png";
    formatBoldImage = staticImages + "/images/format_bold.png";
    formatItalicImage = staticImages + "/images/format_italic.png";
    formatUnderlinedImage = staticImages + "/images/format_underlined.png";
    notesImage = staticImages + "/images/notes.png";
    formatListBulletImage = staticImages + "/images/format_list_bullet.png";
    formatListNumberedImage = staticImages + "/images/format_list_numbered.png";
    formatIndentDecreaseImage =
        staticImages + "/images/format_indent_decrease.png";
    formatIndentIncreaseImage =
        staticImages + "/images/format_indent_increase.png";
    formatQuoteImage = staticImages + "/images/format_quote.png";
    insertLinkImage = staticImages + "/images/insert_link.png";
    strikethroughImage = staticImages + "/images/strikethrough.png";
    formatClearImage = staticImages + "/images/format_clear.png";
    dateRangeImage = staticImages + "/images/date_range.png";
    accessTimeImage = staticImages + "/images/access_time.png";
    ComponentImage = staticImages + "/images/Component.png";
    arrowblueImage = staticImages + "/images/arrowblue.png";
    closePopupImage = staticImages + "/images/Close@2x.png";
    calendarImage = staticImages + "/images/calendar.png";//TP-Phase2 added calendar image png format to support ics file format

    thumbnail_Image = staticImages + "/images/videoImages.PNG"; //sample hardcoded image to check the UI for the Thumnail PopUp

    @track isInvalidFile = false;
    @track TP_thumbnailSizeErrorMessage = TP_thumbnailSizeErrorMessage;
    @api articledatatopreview;
    modalObject;
    @track feedImg;
    //value to send to apex
    isRendered = false;
    @track numbers = {};
    @track userTimeZone = "";
    @track showpreview = false;
    @track isSkippedToggle = true;
    @track showthumbnailClose = false;
    @track notificationIdForPreview;
    @track publishDateValue = { a: [] };
    @track publishLaterFlag = false;
    @track ThumbnailToggle = true;
    @track filteredThumbnailToDisplay = [];
    @track thumbnailUrl = "/TouchPoint/sfc/servlet.shepherd/version/download/";
    @track createNotificationData = {
        notificationBody: "",
        notificationTitle: "",
        audience: "None",
        //category: "None",
        contentGroupValue: "None",
        //contactWebsite: "",
        //contactPhone: "",
        status: "",
        creator: "",
        thumbnailType: "",
        thumbnailName: "",
        thumbnailVersionData: "",
        thumbnailImageId: "",
        isScheduled: false,
        version: "",
        notificationId: "",
        thumbnailActionType: "create",
        actiontype: "create",
        publishTime: "06:00:00",
        //calendarStartTime: "06:00:00",
        //calendarEndTime: "06:00:00",
        archiveTime: "06:00:00",
        //contactName: "",
        //contactEmail: "",
        currentStatus: "",
        pushNotificationFlag: false,
        //Allow comments property
        //allowCommentsFlag : false,
        isPublishedCheckBox: false,
        //eventDescription: "",
        //eventTitle: "",
        //massEmailAddress: "",
        roleValue: "",
        franvalue: "",
        productTeam: "",
        regionValue: "",
        stateValue: "",
        cityValue: "",
        zipValue: "",
        aditionalRoleValue: "",
        filesUploaded: "",
        attachments: "",
        //slideshow: "",
        //slideshowComplete: "",
        buName: "",
        buNameSelected: "",
        creatorName: "",
        videoIds: "",
        videoUpload: "",
        //prontoArticle: "",
        publishNowToggle: false,
        allowThumbnailIOnView: false,
        feature: "",
        unpublishDate: "",
        unpublishFlag: false,
        geoTarget : false,
    };
    createNotificationDataPre;
    @track thumbnailimages = [];
    @track publishFlag = true;
    @track thumbnailFilesUploaded = {};
    @track openmodal = false;
    @track isDualList = true;
    @track isBuName = false;
    @track isEdit = false;
    @track route;
    MAX_FILE_SIZE = TP_thumbnailFileSize; //Max file size 2 MB
    @track mandatory = false;
    @track slectedFranvalue = [];
    @track allDualListValue = {
        slectedFranvalue: [],
        slectedRoleValue: [],
        slectedRegionValue: [],
        slectedStateValue: [],
        slectedCityValue: [],
        slectedZipValue: [],    
        slectedAditionalRoleValue: [],
        slectedProductTeam: [],
        buValue: []
    };
    @track showSpinner = false;
    @track slectedRoleValue = [];
    @track errorMessage =
        "Title and Body fields are mandatory, please fill all the required fields and try again.";
    @track rootStore;
    @track notificationBody;
    @track user;
    @track searchText;
    @track userCatgryBadgeLst;
    @track buNameLst;
    @track userRole;
    @track isDropdown = true;
    @track isNotificationFetched = false;
    @track editNotificationObject;
    @track savePublishArchiveData = {
        publishDate: "",
        publishTime: "",
        //archiveDate: "",
        //archiveTime: ""
    };
    @track openModal = false;
    @track allFranciseData = {
        chooseListLabel: "Available Franchises",
        selectedListLabel: "Chosen Franchises",
        allFrancise: [],
        selectedValue: []
    };

    @track allFranciseRoleData = {
        chooseListLabel: "Available roles",
        selectedListLabel: "Chosen roles",
        allRoleAdditionalRoleValues: [],
        chooseValue: [],
        selectedValue: []
    };

    @track allFranciseRoleAdditionalRlData = {
        chooseListLabel: "Available Additional Roles",
        selectedListLabel: "Chosen Additional Roles",
        allRoleAdditionalRoleValues: [],
        chooseValue: [],
        selectedValue: []
    };
    @track allSFDCProductTeam = {
        chooseListLabel: "Available Product Team",
        selectedListLabel: "Chosen Product Team",
        allRoleAdditionalRoleValues: null,
        chooseValue: [],
        selectedValue: []
    };
    @track allbusinessUnitData = {
        chooseListLabel: "Available Business Unit",
        selectedListLabel: "Chosen Business Unit",
        allRoleAdditionalRoleValues: null,
        chooseValue: [],
        selectedValue: []
    };

    @track allRegionData = {
        chooseListLabel: "Available Region",
        selectedListLabel: "Chosen Region",
        allRegion: [],
        selectedValue: []
      };

    @track allStateData = {
        chooseListLabel: "Available State",
        selectedListLabel: "Chosen State",
        allState: [],
        selectedValue: []
    };
    
    @track allCityData = {
        chooseListLabel: "Available City",
        selectedListLabel: "Chosen City",
        allCity: [],
        selectedValue: []
    };

    @track allZipData = {
        chooseListLabel: "Available Zip",
        selectedListLabel: "Chosen Zip",
        allZip: [],
        selectedValue: []
    };
    @track audience = {
        sizeClass: "categorydropdown-list",
        name: "Audience",
        data: [
            {
                key: "None",
                value: "None"
            }
        ]
    };
    @track contentGroupValue = {
        sizeClass: "categorydropdown-list",
        name: "contentGroup",
        data: [
            {
                key: "None",
                value: "None"
            }
        ]
    };
    @track publishTimeValue = {
        sizeClass: "categorydropdown-list",
        name: "Publish Time",
        data: [
            {
                key: "00:00",
                value: "12:00 AM"
            },
            {
                key: "06:00",
                value: "06:00 AM"
            },
            {
                key: "12:00",
                value: "12:00 PM"
            }
        ]
    };
    @track archiveTimeValue = {
        sizeClass: "categorydropdown-list",
        name: "Archive Time",
        data: [
            {
                key: "00:00",
                value: "12:00 AM"
            },
            {
                key: "06:00",
                value: "06:00 AM"
            },
            {
                key: "12:00",
                value: "12:00 PM"
            }
        ]
    };

    formats = [
        'font',
        'size',
        'bold',
        'italic',
        'underline',
        'strike',
        'list',
        'indent',
        'align',
        'link',
        //'image',
        'clean',
        'table',
        'header',
        'color',
    ];


    apiEndPoint;
    methodType;
    contentType;
    @track hasThumbnail = false;
    @track firsttimeToggle = false;
    @track fileUploadedS3 = [];
    @track videoDataUploaded = [];

    //for tinymce
    @track htmlEditorAllowed = {
        fileAllowed: "image/png,image/jpg,image/jpeg,image/gif,image/ics",//TP-Phase2 added image/ics to support ics file format
        extensionAllowed: ["png", "jpg", "jpeg", "gif", "ics"]//TP-Phase2 added image/ics to support ics file format
    };

    @track userCurrentDate;

    //Updated for Touchpoint Phase 2 – Auto Save 
    timeoutId;
    _interval;
    counter_AutoSave = 0;
    autoSaveFlag = false;
    autoSaveEnableCheck = "None";
    //Ends here

    get pageAction() {
        return this.createNotificationData.notificationId ? "create" : "edit";
    }

    get actionButtonVisibilty() {
        return {
            cancel: true,
            saveAsDraft:
                (this.createNotificationData.actiontype === "edit" &&
                    this.createNotificationData.currentStatus !== "Published") ||
                    this.createNotificationData.actiontype === "create" ||
                    this.createNotificationData.actiontype === "clone"
                    ? true
                    : false,
            publish:
                this.createNotificationData.actiontype === "edit" &&
                    this.createNotificationData.currentStatus === "Published"
                    ? true
                    : false
        };
    }

    //help labels for tooktiip
    helpText = {
        franchiseHelpTxt: franchiseTooltip,
        productTmHelpTxt: productTmTooltip,
        stateHelpTxt: stateTooltip,
        cityHelpTxt: cityTooltip,
        zipHelpTxt: zipTooltip,
        roleHelpTxt: roleTooltip,
        addRoleHelpTxt: addRoleTooltip,
        //massEmailHelpTxt: massEmailTooltip,
        //attachmentsHelpTxt: attachmentsTooltip,
        //videosHelpTxt: videosTooltip,
        //addSlideshowHelpTxt: addSlideshowTooltip,
        publishHelpTxt: publishTooltip,
        //calendarEventHelpTxt: calendarEventTooltip,
        thumbnailImageHelpTxt: thumbnailImageTooltip,
        //prontoHelpTxt: prontoTooltip,
        previewHelpTxt: previewTooltip
    };

    buttonClickValue;

    constructor() {
        super();
        this.rootStore = new lwx("_rootstore");
        //this.rootStore.connect({ notificationBody: "notificationBody" }, this._LWXgetset);
        this.rootStore.connect({ user: "user" }, this._LWXgetset);
        this.rootStore.connect(
            { userCatgryBadgeLst: "badgeCounter" },
            this._LWXgetset
        );
        this.rootStore.connect({ userRole: "userRole" }, this._LWXgetset);
        this.buNameLst = this.user.buName;
        this.userTimeZone = this.user.userTimeZone;
        this.handlePublishToggel();
        if (this.buNameLst && this.buNameLst.length > 1) {
            for (let index = 0; index < this.buNameLst.length; index++) {
                this.allbusinessUnitData.chooseValue.push({
                    key: this.buNameLst[index],
                    value: this.buNameLst[index]
                });
            }

            this.numbers = {
                val0: 1,
                val1: 2,
                val2: 3,
                val3: 4,
                val4: 5,
                val5: 6,
                val6: 7,
                val7: 8,
                val8: 9,
                val9: 10,
                val10: 11,
                val11: 12,
                val12: 13,
                val13: 14,
                val14: 15,
                val15: 16,
                val16: 17,
                val17: 18
            };
        } else {
            this.allDualListValue.buValue = this.buNameLst;
            this.getContentGroupLst(this.buNameLst);
            this.getFranchise(this.buNameLst);
            this.getStateOptions();
            this.getRegioOptions();
            //this.getFolderName(this.buNameLst);
            this.numbers = {
                val0: 0,
                val1: 1,
                val2: 2,
                val3: 3,
                val4: 4,
                val5: 5,
                val6: 6,
                val7: 7,
                val8: 8,
                val9: 9,
                val10: 10,
                val11: 11,
                val12: 12,
                val13: 13,
                val14: 14,
                val15: 15,
                val16: 16,
                val17: 17
            };
        }

        this.isBuName = this.buNameLst && this.buNameLst.length > 1 ? true : false;
        this.createNotificationData.creatorName = this.user.detail.Name;
        //this.createNotificationData.contactName = this.user.detail.Name;
        this.createNotificationData.contactPhone = this.user.detail.Phone;
        this.createNotificationData.contactEmail = this.user.detail.Email;

        this.rootStore.connect(
            {
                route: "route"
            },
            this._LWXgetset
        );

        if (this.route && this.route.params && this.route.params.articleId) {
            this.notificationIdForPreview = this.route.params.articleId;
            this.createNotificationData.notificationId = this.route.params.articleId;
            this.createNotificationData.actiontype = this.route.params.actiontype
                ? this.route.params.actiontype
                : "create";
        }

        //get tp_AppSetting custom metadata
        getCustomMetadata()
            .then((result) => {
                this.autoSaveEnableCheck = result[0].AutoSaveEnable_abv__c;
                this.enableOpenAI = result[0].Enable_AI_abv__c;
            })
            .catch((error) => {
                console.error(error);
            })


        //get Article details by ID
        if (this.createNotificationData.notificationId) {
            this.showSpinner = true;
            this.isDropdown = false;
            pushNotificationDetails({ pushNotificationId: this.createNotificationData.notificationId })
                .then((data) => {
                    if (this.buNameLst && this.buNameLst.length > 1) {
                        this.isEdit = true;
                    }

                    this.showSpinner = false;
                    this.isDropdown = true;
                    let result = [];
                    result.push(data.pushNotificationDetails);
                    this.editNotificationObject = result[0];
                    this.createNotificationData.currentStatus = result[0].status_abv__c;
                    this.createNotificationData.contactWebsite =
                        result[0].Contact_Website_abv__c;


                    this.createNotificationData.contactPhone = result[0].Contact_Phone_abv__c;
                    this.createNotificationData.notificationTitle = result[0].title_abv__c;
                    this.createNotificationData.geoTarget = result[0].Geo_Target_abv__c;
                    if(this.createNotificationData.geoTarget){
                        this.template
                        .querySelectorAll('[data-element="geoTargetCheckbox"]')
                        .forEach((element) => {
                            element.checked = true;
                        });
                      }
                    /*if(result[0].contactName_abv__c) {
                      this.addDataToListWithInd( this.contactData.name ,result[0].contactName_abv__c.split(';'));
                    }
                    
                    if(result[0].contactEmail_abv__c) {
                      this.addDataToListWithInd( this.contactData.email ,result[0].contactEmail_abv__c.split(';'));
                    }
                    
                    if(result[0].Contact_Website_abv__c) {
                      this.addDataToListWithInd( this.contactData.website ,result[0].Contact_Website_abv__c.split(';'));
                    }
                    
                    if(result[0].Contact_Phone_abv__c) {
                      this.addDataToListWithInd( this.contactData.phone ,result[0].Contact_Phone_abv__c.split(';'));
                    }*/

                    if (data.thumbnailName && data.thumbnailName.length > 0) {
                        this.createNotificationData.thumbnailVersionData =
                            data.thumbnailEncodedImage;
                        this.createNotificationData.thumbnailName = data.thumbnailName;
                        this.createNotificationData.thumbnailType = data.thumbnailType;
                        this.createNotificationData.allowThumbnailIOnView = result[0].ThumbnailIOnView__c;
                        this.showthumbnailClose = true;
                        this.createNotificationData.thumbnailActionType = "edit";
                        this.hasThumbnail = true;
                    }
                    this.createNotificationData.thumbnailImageId = result[0]
                        .ThumbnailImageId_abv__c
                        ? result[0].ThumbnailImageId_abv__c
                        : "";
                    if (this.createNotificationData.thumbnailImageId != '') {
                        this.SelectedScr = this.thumbnailUrl + this.createNotificationData.thumbnailImageId;
                    }

                    this.createNotificationData.notificationBody = result[0].body_abv__c;
                    this.createNotificationData.creatorName = result[0].creator_abv__c;
                    this.notificationBody = this.createNotificationData.notificationBody;
                    this.createNotificationData.audience = result[0].Audience_abv__c;
                    //this.createNotificationData.category = result[0].Category_abv__c;
                    //this.createNotificationData.prontoArticle = result[0].Pronto_Link_abv__c;
                    this.createNotificationData.unpublishFlag = result[0].IsUnpublish_abv__c;
                    this.createNotificationData.unpublishDate = result[0].Unpublished_Date_abv__c;


                    this.publishLaterFlag = result[0].Publish_Now__c;
                    /*this.documentImageAudio = this.createdataForFiles(
                      result[0].Attachment_abv__c
                    );*/
                    /*this.slideShowData = this.createdataForFilesSlide(
                      result[0].Slideshow_Complete_URL_abv__c
                    );*/
                    //this.videoData = this.createDataForVideos(result[0].video_abv__c);
                    this.createNotificationData.videoUpload = result[0].videoUpload_abv__c;
                    this.createNotificationData.contentGroupValue =
                        result[0].ContentGroup_abv__c;
                    this.createNotificationData.filesUploaded = result[0].filesURL_abv__c;
                    this.createNotificationData.isScheduled = result[0].Is_Scheduled_abv__c;
                    this.createNotificationData.isPublishedCheckBox = result[0].Is_Published_abv__c;
                    //const currentDate = new Date(Date());
                    //console.log(currentDate);
                    this.createNotificationData.publishDate = data.publishDate
                        ? data.publishDate.substring(0, 10)
                        : this.createNotificationData.publishDate;

                    /*
                    this.createNotificationData.archiveDate = data.archiveDate
                        ? data.archiveDate.substring(0, 10)
                        : this.createNotificationData.archiveDate;
                    this.createNotificationData.archiveTime = data.archiveDate
                        ? data.archiveDate.substring(11, 16)
                        : "06:00";
                    */
                    this.createNotificationData.publishTime = data.publishDate
                        ? data.publishDate.substring(11, 16)
                        : "06:00";

                    this.savePublishArchiveData.publishDate = this.createNotificationData.publishDate;
                    this.savePublishArchiveData.publishTime = this.createNotificationData.publishTime;
                    //this.savePublishArchiveData.archiveDate = this.createNotificationData.archiveDate;
                    //this.savePublishArchiveData.archiveTime = this.createNotificationData.archiveTime;

                    /*this.createNotificationData.calendarStartDate = data.calenderStartDate
                      ? data.calenderStartDate.substring(0, 10)
                      : "";
                    this.createNotificationData.calendarStartTime = data.calenderStartDate
                      ? data.calenderStartDate.substring(11, 16)
                      : "06:00";
                    this.createNotificationData.calendarEndDate = data.calenderEndDate
                      ? data.calenderEndDate.substring(0, 10)
                      : "";
                    this.createNotificationData.calendarEndTime = data.calenderEndDate
                      ? data.calenderEndDate.substring(11, 16)
                      : "06:00";*/
                    this.isNotificationFetched = true;


                    if (result[0].Business_Unit_abv__c) {
                        this.allbusinessUnitData.selectedValue = result[0].Business_Unit_abv__c.split(
                            ";"
                        );
                        this.allDualListValue.buValue = result[0].Business_Unit_abv__c.split(
                            ";"
                        );
                    }
                    if (result[0].franschise_abv__c) {
                        this.allFranciseData.selectedValue = result[0].franschise_abv__c.split(
                            ";"
                        );
                        this.allDualListValue.slectedFranvalue = result[0].franschise_abv__c.split(
                            ";"
                        );
                    }

                    //TP Phase 2- Pick-list limit issue fix

                    /*if (result[0].SFDCProductTeam_abv__c) {
                      this.allSFDCProductTeam.selectedValue = result[0].SFDCProductTeam_abv__c.split(
                        ";"
                      );
                      this.allDualListValue.slectedProductTeam = result[0].SFDCProductTeam_abv__c.split(
                        ";"
                      );
                    }*/
                    if (result[0].SFDCProductTeamText_abv__c) {
                        this.allSFDCProductTeam.selectedValue = result[0].SFDCProductTeamText_abv__c.split(
                            ";"
                        );
                        this.allDualListValue.slectedProductTeam = result[0].SFDCProductTeamText_abv__c.split(
                            ";"
                        );

                    }
                    //TP Phase 2- Pick-list limit issue fix ends here 

                    if (result[0].roles_abv__c) {
                        this.allFranciseRoleData.selectedValue = result[0].roles_abv__c.split(
                            ";"
                        );
                        this.allDualListValue.slectedRoleValue = result[0].roles_abv__c.split(
                            ";"
                        );
                    }
                    if (result[0].additionalRoles_abv__c) {
                        this.allFranciseRoleAdditionalRlData.selectedValue = result[0].additionalRoles_abv__c.split(
                            ";"
                        );
                        this.allDualListValue.slectedAditionalRoleValue = result[0].additionalRoles_abv__c.split(
                            ";"
                        );
                    }
                    if (result[0].selectedRegion_abv__c) {
                        this.allRegionData.selectedValue = result[0].selectedRegion_abv__c.split(
                          ";"
                        );
                        this.allDualListValue.slectedRegionValue = result[0].selectedRegion_abv__c.split(
                          ";"
                        );
                      }
                    if (result[0].State_abv__c) {
                        this.allStateData.selectedValue = result[0].State_abv__c.split(
                          ";"
                        );
                        this.allDualListValue.slectedStateValue = result[0].State_abv__c.split(
                          ";"
                        );
                    }
                    if (result[0].City_abv__c) {
                        this.allCityData.selectedValue = result[0].City_abv__c.split(
                          ";"
                        );
                        this.allDualListValue.slectedCityValue = result[0].City_abv__c.split(
                          ";"
                        );
                    }
                    if (result[0].Zip_abv__c) {
                        this.allZipData.selectedValue = result[0].Zip_abv__c.split(
                          ";"
                        );
                        this.allDualListValue.slectedZipValue = result[0].Zip_abv__c.split(
                          ";"
                        );
                    }

                    //Initiate Auto Save for only Draft and Published articles
                    /*
                    if (this.createNotificationData.actiontype == "edit" && this.createNotificationData.currentStatus == "Draft" && this.autoSaveEnableCheck == 'Yes') {
                        this.counter_AutoSave = 1;
                        this.autoRendering();
                    }
                    */

                    //removeing Ids for clone
                    if (this.createNotificationData.actiontype == "clone") {
                        this.createNotificationData.notificationId = '';
                    }
                })
                .catch((error) => {
                    this.showSpinner = false;
                    console.error(error);
                });
        }

        getAllThumbnailImages()
            .then((result) => {
                if (result) {
                    for (let index = 0; index < result.length; index++) {
                        this.thumbnailimages.push({
                            thumbURL: this.thumbnailUrl + result[index].ThumbnailImageId_abv__c, thumbID: result[index].ThumbnailImageId_abv__c,
                            thumName: result[index].Thumbnailname_abv__c, thumbType: result[index].Thumbnail_Image_Type_abv__c, thumbVersion: result[index].Thumbnail_Version_Data_abv__c, Id: result[index].Id, isSelected: false
                        });

                    }
                    console.log('thumbnailimages=>', this.thumbnailimages);
                    this.filteredThumbnailToDisplay = this.thumbnailimages;
                    console.log('filteredThumbnailToDisplay->', this.filteredThumbnailToDisplay);

                }

            })
            .catch((error) => {
                this.isDualList = true;
                console.error(error);
            });

    }


    handleSearchFilter(event) {
        this.searchText = event.target.value;
        if (this.searchText && this.searchText.length > 0) {
            this.filteredThumbnailToDisplay = this.filterData(this.thumbnailimages, this.searchText);
        }
        else {
            this.filteredThumbnailToDisplay = this.thumbnailimages;
        }
    }

    //filter data for search
    filterData(lst, searchStr) {
        let valueMatch = [];
        if (lst && lst.length > 0) {
            if (searchStr && searchStr == '') {
                return lst;
            }
            else if (searchStr && searchStr.length > 0) {
                for (let i = 0; i < lst.length; i++) {
                    if (lst[i].thumName && lst[i].thumName.length > 0) {
                        if (lst[i].thumName.toLowerCase().includes(searchStr.toLowerCase())) {
                            valueMatch.push(lst[i]);
                        }
                    }
                }
                return valueMatch;
            }
        }
    }

    @track SelectedScr = '';

    getThumbnailUrl(event) {
        var thumbname = event.currentTarget.dataset.thumbname;
        var thumbType = event.currentTarget.dataset.thumbtype;// not in use 
        var thumbVersion = event.currentTarget.dataset.thumbversion; //not in use
        var thumbId = event.currentTarget.dataset.id;
        var thumburl = event.currentTarget.dataset.thumburl;
        var thumbversionid = (thumburl).split('/').pop();
        console.log('thumbversionid->', thumbversionid);
        if (thumburl != undefined) {
            this.SelectedScr = thumburl;
            this.isInvalidFile = false;
        }

        let newRec = [];
        for (let rec of this.thumbnailimages) {
            let temp;
            if (thumbId == rec.Id) {
                temp = {
                    thumbURL: rec.thumbURL,
                    thumName: rec.thumName,
                    thumbType: rec.thumbType,
                    thumbVersion: rec.thumbVersion,
                    thumbversionid: rec.thumbversionid,
                    Id: rec.Id,
                    isSelected: true
                };
            } else {
                temp = {
                    thumbURL: rec.thumbURL,
                    thumName: rec.thumName,
                    thumbType: rec.thumbType,
                    thumbVersion: rec.thumbVersion,
                    thumbversionid: rec.thumbversionid,
                    Id: rec.Id,
                    isSelected: false
                };

            }
            newRec.push(temp);
        }
        this.thumbnailimages = newRec;

        this.filteredThumbnailToDisplay = newRec;


        if (thumbname != undefined) {
            this.thumbnailFilesUploaded.thumbnailName = thumbname;
        }

        if (thumbType != undefined) {
            this.thumbnailFilesUploaded.thumbnailType = thumbType;
        }

        this.thumbnailFilesUploaded.thumbnailVersionData = null;

        if (thumbversionid != undefined) {
            this.thumbnailFilesUploaded.thumbnailImageId = thumbversionid;
        }
        console.log('thumbnail after->', this.thumbnailFilesUploaded.thumbnailImageId);
    }


    getSelectedBuLst(event) {
        if (this.isEdit) {
            this.isEdit = false;
        } else {
            this.createNotificationData.contentGroupValue = "None";
            /*if (
              (this.documentImageAudio && this.documentImageAudio.length > 0) ||
              (this.slideShowData && this.slideShowData.length > 0)
            ) {
              this.documentImageAudio = [];
              this.slideShowData = [];
              this.showErrorSuccessPopup(false, buChange);
            }*/
        }

        this.allDualListValue.buValue = event.detail;
        this.getContentGroupLst(event.detail);
        //this.getFolderName(event.detail);

        if (
            this.allDualListValue.buValue &&
            this.allDualListValue.buValue.length > 0
        ) {
            this.getFranchise(event.detail);
            this.getStateOptions();
        } else {
            this.allDualListValue.buValue = [];
            if (this.template.querySelector(`[data-id="BuName"]`)) {
                this.template.querySelector(`[data-id="BuName"]`).handleRefresh();
            }

            this.allFranciseData.allFrancise = [];
            if (this.template.querySelector(`[data-id="Franchise"]`)) {
                this.template.querySelector(`[data-id="Franchise"]`).handleRefresh();
                this.template.querySelector(`[data-id="Franchise"]`).handleRefresh();
            }
        }

        this.allFranciseData.allFrancise = [];
        this.allSFDCProductTeam.allRoleAdditionalRoleValues = null;
        this.allFranciseRoleData.allRoleAdditionalRoleValues = [];
        this.allFranciseRoleAdditionalRlData.allRoleAdditionalRoleValues = [];

        if (this.template.querySelector(`[data-id="Role"]`)) {
            this.template.querySelector(`[data-id="Role"]`).handleRefresh();
        }
        if (this.template.querySelector(`[data-id="SFDCProductTeam"]`)) {
            this.template
                .querySelector(`[data-id="SFDCProductTeam"]`)
                .handleRefresh();
        }

        if (this.template.querySelector(`[data-id="AddRole"]`)) {
            this.template.querySelector(`[data-id="AddRole"]`).handleRefresh();
            this.template.querySelector(`[data-id="AddRole"]`).handleRefresh();
        }
    }

    getFranchise(bulst) {
        this.isDualList = false;
        this.allFranciseData.allFrancise = [];
        //get Francise
        Franchise({ buList: bulst })
            .then((result) => {
                this.allFranciseData.allFrancise = result;
                this.isDualList = true;
            })
            .catch((error) => {
                this.isDualList = true;
                console.error(error);
            });
    }

    getContentGroupLst(buName) {
        this.contentGroupValue.data = [
            {
                key: "None",
                value: "None"
            }
        ];
        //get content Group
        getContentGroup({ buName: buName })
            .then((result) => {
                for (let index = 0; index < result.length; index++) {
                    this.contentGroupValue.data.push({
                        key: result[index],
                        value: result[index]
                    });
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    closeErrorMessage() {
        this.mandatory = false;
    }

    connectedCallback() {
        let userCurrentDate = this.currentUserLocalTime();
        if (userCurrentDate) {
            this.userCurrentDate = new Date(userCurrentDate);
        }

        //get categories values
        /*getPicklistvalues({
          objectApiName: notificationObjectDetails.apiName,
          fieldApiName: notificationObjectDetails.fields.categories
        })
          .then((result) => {
            for (let index = 0; index < result.length; index++) {
              this.category.data.push({
                key: result[index],
                value: result[index]
              });
            }
          })
          .catch((error) => {
            console.error(error);
          });*/

        //get audiences values
        getPicklistvalues({
            objectApiName: notificationObjectDetails.apiName,
            fieldApiName: notificationObjectDetails.fields.audiences
        })
            .then((result) => {
                for (let index = 0; index < result.length; index++) {
                    this.audience.data.push({
                        key: result[index],
                        value: result[index]
                    });
                }
            })
            .catch((error) => {
                console.error(error);
            });

        /*
        playlistInfo({
            selectstr: "",
            cols:
                "name,API_END_POINT__c, ACCOUNT_ID__c,FUNCTION_IDENTIFIER__c,METHOD_TYPE__c,CONTENT_TYPE__c",
            sobj: "TP_INTEGRATION_UTILITY__c",
            conditions: ["name = 'BRIGHTCOVE_PLAYLIST'"],
            lmt: 1,
            offset: 0
        }).then((data) => {
            let apiEnd = data[0].API_END_POINT__c;
            let accountId = data[0].ACCOUNT_ID__c;
            let functionIdentifier = data[0].FUNCTION_IDENTIFIER__c;
            this.methodType = data[0].METHOD_TYPE__c;
            this.contentType = data[0].CONTENT_TYPE__c;
            this.apiEndPoint = apiEnd + accountId + functionIdentifier;
        });
        */

    }

    renderedCallback() {
        this.modalObject = this.template.querySelector(".toggle-modal");
        try{
            if (
                !this.isRendered &&
                (this.createNotificationData.notificationId || this.createNotificationData.actiontype == "clone") &&
                this.isNotificationFetched == true &&
                this.editNotificationObject
            ) {
                if (this.publishLaterFlag == true) {
                    this.publishLaterFlag = false;
                    if(this.template.querySelector(`[data-id="changePublishnowToggle"]`) !== null){
                        this.template.querySelector(`[data-id="changePublishnowToggle"]`).click();
                    }
                }
                /*
                if (this.createNotificationData.allowThumbnailIOnView && this.template.querySelector(`[data-id="changeThumbnailToggle"]`) !== null) {
                    this.template.querySelector(`[data-id="changeThumbnailToggle"]`).click();
                }
                */

                if (this.editNotificationObject.Is_Scheduled_abv__c) {
                    this.isSkippedToggle = false;
                    this.publishFlag = true;
                }

                //this.createNotificationData.contactName = this.editNotificationObject.contactName_abv__c;
                this.createNotificationData.contactPhone = this.editNotificationObject.Contact_Phone_abv__c;
                this.createNotificationData.contactEmail = this.editNotificationObject.contactEmail_abv__c;

                if (this.editNotificationObject.SendaPushNotification_abv__c && this.template.querySelector(`[data-id="changePushToggle"]`) !== null) {
                    this.template.querySelector(`[data-id="changePushToggle"]`).click();
                }

                //This code is to handle allow comments toggle.
                /*if(this.editNotificationObject.Allow_Comment_abv__c){
                this.template.querySelector(`[data-id="changecommentToggle"]`).click();
                }*/

                //this.createNotificationData.eventDescription = this.editNotificationObject.Notes_abv__c;
                //this.createNotificationData.eventTitle = this.editNotificationObject.Event_Title_abv__c;
                //this.createNotificationData.massEmailAddress = this.editNotificationObject.MassEmail_abv__c;
                this.isSkippedToggle = true;
                this.isRendered = true;
            }

            if (
                (this.createNotificationData.notificationId || this.createNotificationData.actiontype == "clone") &&
                this.isNotificationFetched == true &&
                this.editNotificationObject
            ) {
                /*if (
                this.createNotificationData.calendarStartDate &&
                this.template.querySelector(`[data-id="startDate"]`)
                ) {
                this.template
                    .querySelector(`[data-id="startDate"]`)
                    .rshhAfterDtSet(this.createNotificationData.calendarStartDate);
                }
        
                if (
                this.createNotificationData.calendarEndDate &&
                this.template.querySelector(`[data-id="endDate"]`)
                ) {
                this.template
                    .querySelector(`[data-id="endDate"]`)
                    .rshhAfterDtSet(this.createNotificationData.calendarEndDate);
                }*/

                if (
                    this.createNotificationData.publishDate &&
                    this.template.querySelector(`[data-id="publishDate"]`)
                ) {

                    this.template
                        .querySelector(`[data-id="publishDate"]`)
                        .rshhAfterDtSet(this.createNotificationData.publishDate);
                }
                /*if (
                    this.createNotificationData.archiveDate &&
                    this.template.querySelector(`[data-id="archiveDate"]`)
                ) {
                    this.template
                        .querySelector(`[data-id="archiveDate"]`)
                        .rshhAfterDtSet(this.createNotificationData.archiveDate);
                }
                if (
                this.createNotificationData.calendarStartTime &&
                this.template.querySelector(`[data-id="startTime"]`)
                ) {
                this.template
                    .querySelector(`[data-id="startTime"]`)
                    .rshhAfterDtSet(this.createNotificationData.calendarStartTime);
                }
        
                if (
                this.createNotificationData.calendarEndTime &&
                this.template.querySelector(`[data-id="endTime"]`)
                ) {
                this.template
                    .querySelector(`[data-id="endTime"]`)
                    .rshhAfterDtSet(this.createNotificationData.calendarEndTime);
                }*/

                if (
                    this.template.querySelector(`[data-id="publishTime"]`) &&
                    this.createNotificationData.publishTime
                ) {
                    this.template
                        .querySelector(`[data-id="publishTime"]`)
                        .rshhAfterDtSet(this.createNotificationData.publishTime);
                }

                /*if (
                    this.template.querySelector(`[data-id="arhiveTime"]`) &&
                    this.createNotificationData.archiveTime
                ) {
                    this.template
                        .querySelector(`[data-id="arhiveTime"]`)
                        .rshhAfterDtSet(this.createNotificationData.archiveTime);
                }
                */
            }

            

        }catch(e){
            this.showSpinner = false;
            console.error(e);
        }
    }

    @track remainingTitleLength = 100;

    handleTitleInput(event){
       this.remainingTitleLength = event.target.value && event.target.value != '' ? 100 - Number(event.target.value.length) : 100; 
    }

    /*getFolderName(buLst) {
      if (!buLst || buLst.length < 1) {
        this.folderName = "";
      } else {
        let tempFolderName = "";
        if (buLst.includes("Commercial")) {
          tempFolderName = "Commercial";
        }
        if (buLst.includes("Medical")) {
          tempFolderName += "Medical";
        }
        if (buLst.includes("Patient Outreach")) {
          tempFolderName += "PatientOutreach";
        }
        tempFolderName = "Touchpoint/" + tempFolderName;
        this.folderName = tempFolderName;
      }
    }*/

    //making file data for edit article
    createdataForFiles(data) {
        let templst = [];
        if (data && data.length > 0) {
            let allUrl = data.split(";");
            for (let i = 0; i < allUrl.length; i++) {
                if (allUrl[i] && allUrl[i].length > 0) {
                    let fileName = decodeURIComponent(allUrl[i]).split("/");
                    templst.push({
                        s3Link: allUrl[i],
                        fileName: fileName[fileName.length - 1].replaceAll("+", " "),
                        ind: i
                    });
                }
            }
        }

        return templst;
    }

    //making file data for edit article(Slideshow)
    createdataForFilesSlide(data) {
        let templst = [];
        if (data && data.length > 0) {
            let allUrl = data.split(";");
            for (let i = 0; i < allUrl.length; i++) {
                if (allUrl[i] && allUrl[i].length > 0) {
                    let fileNameFirst = decodeURIComponent(allUrl[i]).split("!");
                    let fileName = decodeURIComponent(fileNameFirst[fileNameFirst.length - 5]).split("/");
                    templst.push({
                        s3Link: fileNameFirst[fileNameFirst.length - 5],
                        fileName: fileName[fileName.length - 1],
                        ind: i,
                        thumbnailRef: fileNameFirst[fileNameFirst.length - 4],
                        imgdesc: fileNameFirst[fileNameFirst.length - 2],
                        index: fileNameFirst[fileNameFirst.length - 1],

                    });
                }
            }
        }
        return templst;
    }

    //making video data for edit article
    createDataForVideos(data) {
        let templst = [];
        if (data && data.length > 0) {
            let allVideo = data.split(";");
            for (let i = 0; i < allVideo.length; i++) {
                if (allVideo[i] && allVideo[i].length > 0) {
                    let tempVideoDetail = allVideo[i].split("::");
                    templst.push({
                        videoId: tempVideoDetail[0],
                        fileName: tempVideoDetail[1],
                        ind: i
                    });
                }
            }
        }
        return templst;
    }


    currentUserLocalTime() {
        // create Date object for current location
        let d = new Date();

        // convert to msec
        // add local time zone offset
        // get UTC time in msec
        let utc = d.getTime() + d.getTimezoneOffset() * 60000;
        let isNeg = this.user.currentOffset.indexOf("-") != -1 ? true : false;
        let positiveNo = isNeg
            ? this.user.currentOffset.replace("-", "")
            : this.user.currentOffset;
        let currentOffset = this.timeStringToFloat(positiveNo);

        // create new Date object for different city
        // using supplied offset
        currentOffset = isNeg ? "-" + currentOffset : currentOffset;
        let nd = new Date(utc + 3600000 * currentOffset);
        // return time as a string

        let userCurrentDate = nd.toLocaleString();
        if (navigator.userAgent.match(/iPhone|iPad/i) || String(window.navigator.platform).toLowerCase().includes('mac')) {
            let tempUserCurrentDate = '';
            let tempDateLst = userCurrentDate.split(', ');
            let tempDateSplit = tempDateLst[0].split('/');
            tempUserCurrentDate = '' + tempDateSplit[1] + '/' + tempDateSplit[0] + '/' + tempDateSplit[2] + ', ' + tempDateLst[1];
            userCurrentDate = tempUserCurrentDate;
        }

        return userCurrentDate;
    }

    timeStringToFloat(time) {
        var hoursMinutes = time.split(/[.:]/);
        var hours = parseInt(hoursMinutes[0], 10);
        var minutes = hoursMinutes[1] ? parseInt(hoursMinutes[1], 10) : 0;
        return hours + minutes / 60;
    }

    //show error success Popup
    showErrorSuccessPopup(isSuccess, msg) {
        msg = msg ? msg.replaceAll("Article" , "Notification") : '';
        this.rootStore
            .getconnector()
            .dispatch("showErrorSuccess", { isSuccess: isSuccess, messages: [msg] });
    }

    //show error success Popup
    showErrorinfoPopup(isSuccess, msg, isinfo) {
        msg = msg ? msg.replaceAll("Article" , "Notification") : '';
        this.rootStore
            .getconnector()
            .dispatch("showErrorSuccess", { isSuccess: isSuccess, messages: [msg], isinfo: isinfo });
    }
    //show unpublish success Popup
    showUnpublishinfoPopup(isSuccess, msg, isUnpublishInfo) {
        msg = msg ? msg.replaceAll("Article" , "Notification") : '';
        this.rootStore
            .getconnector()
            .dispatch("showErrorSuccess", { isSuccess: isSuccess, messages: [msg], isUnpublishInfo: isUnpublishInfo });
    }

    //getting value for franchise
    getSelectedFranchiseFrmChild(event) {
        this.allDualListValue.slectedFranvalue = event.detail ? event.detail : [];
        if (
            this.allDualListValue.slectedFranvalue &&
            this.allDualListValue.slectedFranvalue.length > 0
        ) {
            this.getRole(
                this.allDualListValue.slectedFranvalue,
                "Franchise",
                this.allFranciseRoleData,
                "Role"
            );
            this.getRole(
                this.allDualListValue.slectedFranvalue,
                "Franchise",
                this.allSFDCProductTeam,
                "SFDCProductTeam"
            );
            this.getSelFranchiseRegions(
                this.allDualListValue.slectedFranvalue,
                this.allDualListValue.buValue
              );
        } else {
            this.allSFDCProductTeam.allRoleAdditionalRoleValues = null;
            this.allFranciseRoleData.allRoleAdditionalRoleValues = [];
            this.allFranciseRoleAdditionalRlData.allRoleAdditionalRoleValues = [];
            this.allRegionData.allRegion = [];
            //this.allStateData.allState = [];
            //this.allCityData.allCity = [];
            //this.allZipData.allZip = [];
            if (this.template.querySelector(`[data-id="Role"]`)) {
                this.template.querySelector(`[data-id="Role"]`).handleRefresh();
            }
            if (this.template.querySelector(`[data-id="SFDCProductTeam"]`)) {
                this.template
                    .querySelector(`[data-id="SFDCProductTeam"]`)
                    .handleRefresh();
            }
        }

        if (this.template.querySelector(`[data-id="AddRole"]`)) {
            this.template.querySelector(`[data-id="AddRole"]`).handleRefresh();
            this.template.querySelector(`[data-id="AddRole"]`).handleRefresh();
        }
        /*if (this.template.querySelector(`[data-id="State"]`)) {
            this.template.querySelector(`[data-id="State"]`).handleRefresh();
        }
        if (this.template.querySelector(`[data-id="City"]`)) {
            this.template.querySelector(`[data-id="City"]`).handleRefresh();
        }
        if (this.template.querySelector(`[data-id="Zip"]`)) {
            this.template.querySelector(`[data-id="Zip"]`).handleRefresh();
        }*/
    }
    //getting value for SFDCProductTeam
    getSFDCProductTeam(event) {
        this.allDualListValue.slectedProductTeam = event.detail ? event.detail : [];
        if(this.allDualListValue.slectedProductTeam && this.allDualListValue.slectedProductTeam.length > 0){
            //this.getRepRoasterWithSalesforcecode(this.allDualListValue.slectedProductTeam);
            //this.enableGeolocation = false;
        }else {      
            this.allRegionData.allRegion = [];  
            //this.allStateData.allState = [];
            //this.allCityData.allCity = [];
            //this.allZipData.allZip = [];      
        }
        if (this.template.querySelector(`[data-id="State"]`)) {
            this.template.querySelector(`[data-id="State"]`).handleRefresh();
        }
        if (this.template.querySelector(`[data-id="City"]`)) {
            this.template.querySelector(`[data-id="City"]`).handleRefresh();
        }
        if (this.template.querySelector(`[data-id="Zip"]`)) {
            this.template.querySelector(`[data-id="Zip"]`).handleRefresh();
        }
    }
    //getting value forRole
    getSelectedRoleFrmChild(event) {
        this.allDualListValue.slectedRoleValue = event.detail ? event.detail : [];
        if (this.allDualListValue.slectedRoleValue) {
            this.getRoleAndAdditionalRole(
                this.allDualListValue.slectedRoleValue,
                "Role",
                this.allFranciseRoleAdditionalRlData,
                "Additional Role"
            );
        } else {
            this.allFranciseRoleAdditionalRlData.allRoleAdditionalRoleValues = [];
            if (this.template.querySelector(`[data-id="AddRole"]`)) {
                this.template.querySelector(`[data-id="AddRole"]`).handleRefresh();
            }
        }
    }
    //getting value for Additional Role
    getSelectedAditionalFrmChild(event) {
        this.allDualListValue.slectedAditionalRoleValue = event.detail
            ? event.detail
            : [];
    }

    getRole(selectedvalue, typeValue, setValues, DependentTypeValue) {
        FranchiseRole({
            selectedLst: selectedvalue,
            type: typeValue,
            dependentType: DependentTypeValue,
            buName: this.allDualListValue.buValue
        })
            .then((result) => {
                if (DependentTypeValue == "SFDCProductTeam") {
                    setValues.allRoleAdditionalRoleValues =
                        result && result.length > 0 ? result : null;
                } else if (DependentTypeValue == "Role") {
                    setValues.allRoleAdditionalRoleValues = result;
                }

                if (this.template.querySelector(`[data-id="Role"]`)) {
                    this.template.querySelector(`[data-id="Role"]`).handleRefresh();
                }
                if (this.template.querySelector(`[data-id="SFDCProductTeam"]`)) {
                    this.template
                        .querySelector(`[data-id="SFDCProductTeam"]`)
                        .handleRefresh();
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    getRoleAndAdditionalRole(
        selectedvalue,
        typeValue,
        setValues,
        DependentTypeValue
    ) {
        FranchiseRole({
            selectedLst: selectedvalue,
            type: typeValue,
            dependentType: DependentTypeValue,
            buName: this.allDualListValue.buValue
        })
            .then((result) => {
                setValues.allRoleAdditionalRoleValues = result;
                if (this.template.querySelector(`[data-id="AddRole"]`)) {
                    this.template.querySelector(`[data-id="AddRole"]`).handleRefresh();
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    //get All the input value from Component
    getAllValue() {

        //Publish Now Toggle
        this.createNotificationData.publishNowToggle = this.publishLaterFlag;
        console.log('this.publishLaterFlag->', this.publishLaterFlag);
        console.log('toggle->', this.createNotificationData.publishNowToggle);
        this.createNotificationData.allowThumbnailIOnView =
            this.ThumbnailToggle && this.showthumbnailClose ? true : false;
        //calender event
        /*if (this.template.querySelector(`[data-id="calenderDescription"]`).value) {
          this.createNotificationData.eventDescription = this.template.querySelector(
            `[data-id="calenderDescription"]`
          ).value;
        }
        if (this.template.querySelector(`[data-id="calenderTitle"]`)) {
          this.createNotificationData.eventTitle = this.template.querySelector(
            `[data-id="calenderTitle"]`
          ).value;
        }*/

        //article data
        if (this.template.querySelector(`[data-id="notificationTitle"]`)) {
            this.createNotificationData.notificationTitle = this.template.querySelector(
                `[data-id="notificationTitle"]`
            ).value;
        }
        //dual list data
        if (
            this.allDualListValue.slectedFranvalue &&
            this.allDualListValue.slectedFranvalue.length > 0
        ) {
            this.createNotificationData.franvalue = this.allDualListValue.slectedFranvalue.join(
                ";"
            );
        }
        if (
            this.allDualListValue.slectedRoleValue &&
            this.allDualListValue.slectedRoleValue.length > 0
        ) {
            this.createNotificationData.roleValue = this.allDualListValue.slectedRoleValue.join(
                ";"
            );
        }
        if (
            this.allDualListValue.slectedAditionalRoleValue &&
            this.allDualListValue.slectedAditionalRoleValue.length > 0
        ) {
            this.createNotificationData.aditionalRoleValue = this.allDualListValue.slectedAditionalRoleValue.join(
                ";"
            );
        }
        if (
            this.allDualListValue.slectedProductTeam &&
            this.allDualListValue.slectedProductTeam.length > 0
        ) {
            this.createNotificationData.productTeam = this.allDualListValue.slectedProductTeam.join(
                ";"
            );
        }
        if (
            this.allDualListValue.slectedRegionValue &&
            this.allDualListValue.slectedRegionValue.length > 0
          ) {
            this.createNotificationData.regionValue = this.allDualListValue.slectedRegionValue.join(
              ";"
            );
          }
        if (
            this.allDualListValue.slectedStateValue &&
            this.allDualListValue.slectedStateValue.length > 0
        ) {
            this.createNotificationData.stateValue = this.allDualListValue.slectedStateValue.join(
              ";"
            );
        }
        if (
            this.allDualListValue.slectedCityValue &&
            this.allDualListValue.slectedCityValue.length > 0
        ) {
            this.createNotificationData.cityValue = this.allDualListValue.slectedCityValue.join(
              ";"
            );
        }
        if (
            this.allDualListValue.slectedZipValue &&
            this.allDualListValue.slectedZipValue.length > 0
        ) {
            this.createNotificationData.zipValue = this.allDualListValue.slectedZipValue.join(
              ";"
            );
        }

        // Mass Email
        /*if (this.template.querySelector(`[data-id="massEmailAddress"]`)) {
          this.createNotificationData.massEmailAddress = this.template.querySelector(
            `[data-id="massEmailAddress"]`
          ).value;
        }*/

        // pronto Article
        /*if (this.template.querySelector(`[data-id="prontoArticle"]`)) {
          this.createNotificationData.prontoArticle = this.template.querySelector(
            `[data-id="prontoArticle"]`
          ).value;
        }*/

        //Contact data

        /*this.createNotificationData.contactName = this.contactData.name && this.contactData.name.length > 0 ? 
                                            this.getcontactValue(this.contactData.name) :"";
    
        this.createNotificationData.contactEmail = this.contactData.email && this.contactData.email.length > 0 ? 
                                              this.getcontactValue(this.contactData.email) : "";
    
        this.createNotificationData.contactWebsite = this.contactData.website && this.contactData.website.length > 0 ? 
                                                this.getcontactValue(this.contactData.website):'';
    
        this.createNotificationData.contactPhone = this.contactData.phone && this.contactData.phone.length > 0 ? 
                                              this.getcontactValue(this.contactData.phone):'';*/


        //creater name  creator
        if (this.template.querySelector(`[data-id="creator"]`)) {
            this.createNotificationData.creatorName = this.template.querySelector(
                `[data-id="creator"]`
            ).value;
        }

        //Amazon s3 upload
        if (this.fileUploadedS3 && this.fileUploadedS3.length > 0) {
            let allUpload = "";
            for (let i = 0; i < this.fileUploadedS3.length > 0; i++) {
                if (i == 0) {
                    allUpload =
                        this.fileUploadedS3[i].s3Link +
                        "::" +
                        this.fileUploadedS3[i].thumbnailRef +
                        "::" +
                        this.fileUploadedS3[i].fileName;
                } else {
                    allUpload +=
                        ";" +
                        this.fileUploadedS3[i].s3Link +
                        "::" +
                        this.fileUploadedS3[i].thumbnailRef +
                        "::" +
                        this.fileUploadedS3[i].fileName;
                }
            }

            if (
                this.createNotificationData.filesUploaded &&
                this.createNotificationData.filesUploaded.length > 0 &&
                !this.autoSaveFlag
            ) {
                this.createNotificationData.filesUploaded += ";" + allUpload;
            } else {
                this.createNotificationData.filesUploaded = allUpload;
            }
        }

        //TP - Phase 2 - SlideShow Complete upload
        /*if (this.slideShowData && this.slideShowData.length > 0) {
          let allUploadSlide = "";
          for (let i = 0; i < this.slideShowData.length > 0; i++) {
            if (i == 0) {
              allUploadSlide =
                this.slideShowData[i].s3Link +
                "!" +
                this.slideShowData[i].thumbnailRef +
                "!" +
                this.slideShowData[i].fileName +
                "!" +
                this.slideShowData[i].imgdesc +
                "!" +
                this.slideShowData[i].index;
            } else {
              allUploadSlide +=
                ";" +
                this.slideShowData[i].s3Link +
                "!" +
                this.slideShowData[i].thumbnailRef +
                "!" +
                this.slideShowData[i].fileName +
                "!" +
                this.slideShowData[i].imgdesc +
                "!" +
                this.slideShowData[i].index;
            }
          }
    
          if (
            this.createNotificationData.slideshowComplete &&
            this.createNotificationData.slideshowComplete.length > 0 &&
            !this.autoSaveFlag
          ) {
            this.createNotificationData.slideshowComplete += ";" + allUploadSlide;
          } else {
            this.createNotificationData.slideshowComplete = allUploadSlide;
          }
        }*/

        //Amazon s3 file
        /*if (this.documentImageAudio && this.documentImageAudio.length > 0) {
          let allFiles = "";
          for (let i = 0; i < this.documentImageAudio.length > 0; i++) {
            if (i == 0) {
              allFiles = this.documentImageAudio[i].s3Link;
            } else {
              allFiles += ";" + this.documentImageAudio[i].s3Link;
            }
          }
          this.createNotificationData.attachments = allFiles;
        }*/

        //Slide Show image
        /*if (this.slideShowData && this.slideShowData.length > 0) {
          let allFiles = "";
          for (let i = 0; i < this.slideShowData.length > 0; i++) {
            if (i == 0) {
              allFiles = this.slideShowData[i].s3Link;
            } else {
              allFiles += ";" + this.slideShowData[i].s3Link;
            }
          }
          this.createNotificationData.slideshow = allFiles;
        }*/

        //Video uload
        /*if (this.videoDataUploaded && this.videoDataUploaded.length > 0) {
          let allvideo = "";
          for (let i = 0; i < this.videoDataUploaded.length; i++) {
            if (i == 0) {
              allvideo =
                this.videoDataUploaded[i].videoId +
                "::" +
                this.videoDataUploaded[i].fileName +
                "::" +
                this.videoDataUploaded[i].thumbnailRef;
            } else {
              allvideo +=
                ";" +
                this.videoDataUploaded[i].videoId +
                "::" +
                this.videoDataUploaded[i].fileName +
                "::" +
                this.videoDataUploaded[i].thumbnailRef;
            }
          }
    
          if (
            this.createNotificationData.videoUpload &&
            this.createNotificationData.videoUpload.length > 0 &&
            !this.autoSaveFlag
          ) {
            this.createNotificationData.videoUpload += ";" + allvideo;
          } else {
            this.createNotificationData.videoUpload = allvideo;
          }
        }*/

        //Video saved
        /*if (this.videoData && this.videoData.length > 0) {
          let allvideo = "";
          for (let i = 0; i < this.videoData.length; i++) {
            if (i == 0) {
              allvideo =
                this.videoData[i].videoId + "::" + this.videoData[i].fileName;
            } else {
              allvideo +=
                ";" + this.videoData[i].videoId + "::" + this.videoData[i].fileName;
            }
          }
          this.createNotificationData.videoIds = allvideo;
        }*/

        if (
            this.allDualListValue.buValue &&
            this.allDualListValue.buValue.length > 0
        ) {
            this.createNotificationData.buNameSelected = this.allDualListValue.buValue.join(
                ";"
            );
        }
    }

    //createing message for mandetory fields
    hendleMandatoryFld() {
        var msg =
            " field is mandatory, please fill all the required fields and try again.";
        var allEmptyField = [];
        var isValid = true;

        if (!this.createNotificationData.buNameSelected) {
            allEmptyField.push("Business Unit");
            isValid = false;
        }

        //Category cannot be None
        /*if (
           
          this.createNotificationData.category === "None" || 
          this.createNotificationData.category === "" || 
          this.createNotificationData.category === undefined || 
          this.createNotificationData.category === "undefined"
          ) {
          allEmptyField.push("Category");
          isValid = false;
        }*/

        //Audience cannot be None
        if (

            this.createNotificationData.audience === "None" ||
            this.createNotificationData.audience === "" ||
            this.createNotificationData.audience === undefined ||
            this.createNotificationData.audience === "undefined"
        ) {
            allEmptyField.push("Audience");
            isValid = false;
        }

        if (
            this.createNotificationData.contentGroupValue &&
            this.createNotificationData.contentGroupValue == "None"
        ) {
            allEmptyField.push("Content Group");
            isValid = false;
        }

        //validation for article title
        if (!this.createNotificationData.notificationTitle) {
            allEmptyField.push("Title ");
            isValid = false;
        }

        //validation for article body
        /*if (!this.notificationBody) {
          allEmptyField.push("Body ");
          isValid = false;
        }*/

        //validation for thumbnail immage
        /*
        if (!this.createNotificationData.thumbnailName) {
            allEmptyField.push('Thumbnail ');
            isValid = false;
        }*/

        //contact Name
        /*if (!this.createNotificationData.contactName) {
          allEmptyField.push("Contact Name ");
          isValid = false;
        }*/

        //contact Email
        /*if (!this.createNotificationData.contactEmail) {
          allEmptyField.push("Contact Email ");
          isValid = false;
        }*/

        //calender Event
        /*if (
          this.createNotificationData.calendarStartDate ||
          this.createNotificationData.calendarEndDate ||
          this.createNotificationData.eventTitle
        ) {
          if (!this.createNotificationData.calendarStartDate) {
            allEmptyField.push("Calender Event Start Date ");
            isValid = false;
          }
          if (!this.createNotificationData.calendarEndDate) {
            allEmptyField.push("Calender Event End Date");
            isValid = false;
          }
          if (!this.createNotificationData.eventTitle) {
            allEmptyField.push("Calender Event Title");
            isValid = false;
          }
        }*/

        //validation for dualBox
        if (!this.createNotificationData.franvalue) {
            allEmptyField.push("Franchises");
            isValid = false;
        }

        if (!this.createNotificationData.roleValue) {
            allEmptyField.push("Role");
            isValid = false;
        }

        if (!this.createNotificationData.aditionalRoleValue) {
            allEmptyField.push("Additional Role");
            isValid = false;
        }

        if (allEmptyField.length > 1) {
            msg =
                " fields are mandatory, please fill all the required fields and try again.";
        }
        if (!isValid) this.handleErrorMessage(allEmptyField.join(", ") + msg);

        return isValid;
    }

    //Email validation
    /*handleMassEmailValidation() {
      if (this.createNotificationData.massEmailAddress) {
        let emailList = this.createNotificationData.massEmailAddress.split(";");
        let temp = "";
        let regExpEmailformat = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        for (let i = 0; i < emailList.length; i++) {
          temp = emailList[i].trim();
          if (!temp.match(regExpEmailformat)) {
            return false;
          }
        }
      }
      return true;
    }*/

    //Contact Email validation
    handleContactEmailValidation() {
        if (this.createNotificationData.contactEmail) {
            let emailList = this.createNotificationData.contactEmail.split(";");
            let temp = "";
            let regExpEmailformat = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            for (let i = 0; i < emailList.length; i++) {
                temp = emailList[i].trim();
                if (!temp.match(regExpEmailformat)) {
                    return false;
                }
            }
        }
        return true;
    }

    //handling validation for all input
    handleValidation() {
        let msg =
            "field is mandatory, please fill all the required fields and try again.";
        let userlocal = this.currentUserLocalTime();
        console.log('hendleMandatoryFld--->', this.hendleMandatoryFld());
        if (!this.hendleMandatoryFld()) {
            return false;
        }
        // article title must be less than 100
        if (
            this.createNotificationData.notificationTitle &&
            this.createNotificationData.notificationTitle.length > 100
        ) {
            this.handleErrorMessage(
                "Please note that Notification title is limited to 100 characters or less, including spaces"
            );
            return false;
        }

        //email validation
        /*if (!this.handleMassEmailValidation()) {
          this.handleErrorMessage("Invalid Mass Email address");
          return false;
        }*/

        //Contact email validation
        /*if (!this.handleContactEmailValidation()) {
          this.handleErrorMessage("Invalid Contact Email address");
          return false;
        }*/

        //email address for mass email cant not be more than 15
        /*if (this.createNotificationData.massEmailAddress) {
          let emailLst = this.createNotificationData.massEmailAddress.split(";");
          if (emailLst && emailLst.length > 15) {
            this.handleErrorMessage(
              "Email addresses for mass email can not be more than 15"
            );
            return false;
          }
        }*/

        //Contact email address for mass email cant not be more than 15
        /*if (this.createNotificationData.contactEmail) {
          let emailLst = this.createNotificationData.contactEmail.split(";");
          if (emailLst && emailLst.length > 3) {
            this.handleErrorMessage(
              "Email addresses for contact email can not be more than 3"
            );
            return false;
          }
        }*/

        //article body must me less than this
        console.log('this.notificationBody--->', this.notificationBody);
        const bodyWithoutHTML = this.notificationBody ? this.notificationBody.replace( /(<([^>]+)>)/ig, '').trim() : '';
        console.log('after removing HTML tags : ' , bodyWithoutHTML );
        if (this.notificationBody && bodyWithoutHTML.length > 200) {//131072
            this.handleErrorMessage(
                "Length of body is greater then allowed limit, please reduce the length and try again"
            );
            return false;
        }

        //event title length must be less than 100
        /*if (
          this.createNotificationData.eventTitle &&
          this.createNotificationData.eventTitle.length > 100
        ) {
          this.handleErrorMessage(
            "Please note that Event title is limited to 100 characters or less, including spaces"
          );
          return false;
        }
        if (
          this.createNotificationData.eventDescription &&
          this.createNotificationData.eventDescription.length >= 32000
        ) {
          this.handleErrorMessage(
            "Length of event body is greater then allowed limit, please reduce the length and try again"
          );
          return false;
        }*/
        //Modified for phase 2 reuirement , 
        //By passing the date validation check when Unpublish button is clikced.
        /*if(this.buttonClickValue!='unpublish'){
          if (
            this.createNotificationData.calendarStartDate ||
            this.createNotificationData.calendarEndDate ||
            this.createNotificationData.eventTitle
          ) {
            let comparableStartDateTime =
              this.createNotificationData.calendarStartDate +
              " " +
              this.createNotificationData.calendarStartTime;
            let comparableEndDateTime =
              this.createNotificationData.calendarEndDate +
              " " +
              this.createNotificationData.calendarEndTime;
              
            if (
              new Date(comparableStartDateTime).getTime() <=
              new Date(userlocal).getTime()
            ) {
              this.handleErrorMessage(
                "Event Start time can not be less than or equal current time, please change and try again"
              );
              return false;
            }
    
            if (
              new Date(comparableEndDateTime).getTime() <=
              new Date(comparableStartDateTime).getTime()
            ) {
              this.handleErrorMessage(
                "Event End date can not be less or equal to Event Start date, please change and try again"
              );
              return false;
            }
          }
        }*/

        //validation for article publish Date
        if (!this.publishLaterFlag) {
            if (!this.createNotificationData.publishDate) {
                this.handleErrorMessage(
                    "Notification Publish date is mandatory, please select Publish Date and try again."
                );
                return false;
            }
            /*
            if (!this.createNotificationData.archiveDate) {
                this.handleErrorMessage(
                    "Article Archive date is mandatory, please select Archive Date and try again."
                );
                return false;
            }
            */
        }

        if (!this.publishLaterFlag) {
            if (
                !(
                    this.createNotificationData.currentStatus == "Published" &&
                    this.createNotificationData.actiontype === "edit"
                )
            ) {
                let comparablePublishDate =
                    this.createNotificationData.publishDate +
                    " " +
                    this.createNotificationData.publishTime;
                /*
                let comparableArchiveDate =
                    this.createNotificationData.archiveDate +
                    " " +
                    this.createNotificationData.archiveTime;

                if (
                    new Date(comparableArchiveDate).getTime() <=
                    new Date(comparablePublishDate).getTime()
                ) {
                    this.handleErrorMessage(
                        "Archive date can not be less than publish date or current date, please change and try again"
                    );
                    return false;
                }
                */

                if (
                    new Date(comparablePublishDate).getTime() <=
                    new Date(userlocal).getTime()
                ) {
                    this.handleErrorMessage(
                        "Publish Start time can not be less than current time, please change and try again"
                    );
                    return false;
                }
            } else if (
                this.createNotificationData.currentStatus == "Published" &&
                this.createNotificationData.actiontype === "edit" &&
                this.savePublishArchiveData.publishDate
            ) {
                let comparablePublishDate =
                    this.createNotificationData.publishDate +
                    " " +
                    this.createNotificationData.publishTime;
                let comparableArchiveDate =
                    this.createNotificationData.archiveDate +
                    " " +
                    this.createNotificationData.archiveTime;

                let comparablePublishDateSaved =
                    this.savePublishArchiveData.publishDate +
                    " " +
                    this.savePublishArchiveData.publishTime;
                let comparableArchiveDateSaved =
                    this.savePublishArchiveData.archiveDate +
                    " " +
                    this.savePublishArchiveData.archiveTime;

                //removing archive date unchage validation
                if (
                    comparablePublishDate != comparablePublishDateSaved
                ) {
                    this.handleErrorMessage(
                        "You are not allowed to update the Date/Time for already published Notification."
                    );
                    return false;
                }
            }
        }

        return true;
    }

    //Display error message
    handleErrorMessage(msg) {
        this.errorMessage = msg;
        this.mandatory = true;
        this.template.querySelector(`[data-id="error"]`).focus();
    }

    // handle submit and  save as draft
    handleCallbackToApex(event) {
        console.log('before spinner');
        this.showSpinner = true;
        console.log('after spinner');
        var buttonClick;
        if (event == undefined) {
            if (this.unpublishFlag == true) {
                buttonClick = 'unpublish';
                this.buttonClickValue = buttonClick;
            }
        } else if (event != undefined) {
            buttonClick = event.target.dataset.id;
            this.buttonClickValue = buttonClick;
        }
        this.buttonClickValue = buttonClick;
        //getting all input value
        this.getAllValue();
        console.table('createNotificationData--->', this.createNotificationData);
        var msg;
        let userlocal = this.currentUserLocalTime();

        //if validation failes then stop further execution
        console.log('this.handleValidation--->', this.handleValidation());
        if (!this.handleValidation()) {
            this.showSpinner = false;
            return false;
        }
        console.log('AFTERhandleValidation--->');

        this.createNotificationData.notificationBody = this.notificationBody;
        this.createNotificationData.publishFlag = true; //this.publishFlag;
        if (this.createNotificationData.publishNowToggle == false) {
            this.createNotificationData.isScheduled = true; //this.publishFlag;   
        } else {
            this.createNotificationData.isScheduled = false; //this.publishFlag;   
        }


        if (buttonClick == "submit") {
      //Modified for phase 2 reuirement 
     /* if(this.createNotificationData.unpublishFlag == false){  
        this.createNotificationData.publishNowToggle=true; //3 Dec - UAT fix on publish toggle issue 

      }else*/ if (this.createNotificationData.unpublishFlag == true) {
                this.createNotificationData.unpublishDate = null;
                this.createNotificationData.unpublishFlag = false;
            }

            this.createNotificationData.status = "Published";
            this.createNotificationData.version = 1.0;
            msg = "This request is submited Successfully";

            if (this.publishLaterFlag ||
                (this.createNotificationData.actiontype === "edit" &&
                    this.createNotificationData.isPublishedCheckBox &&
                    this.createNotificationData.currentStatus === "Published")
            ) {
                this.createNotificationData.status = "Published";
            } else {
                this.createNotificationData.status = "Scheduled";
            }
        } else if (buttonClick == "saveAsDraft") {
            if (!this.createNotificationData.notificationId) {
                this.createNotificationData.status = "Draft";
            }
            else {
                // this.createNotificationData.status = this.createNotificationData.currentStatus ? this.createNotificationData.currentStatus : "Draft" ;
                this.createNotificationData.status = "Draft";   //Done for changes related to moving schedule articles to draft
            }

            if (this.createNotificationData.actiontype == "clone") {
                this.createNotificationData.status = "Draft";
            }
            //Commented due to  “Scheduled” article publish date issue in draft state - 2/March/2022
            //this.createNotificationData.publishDate = '';    //Done for changes related to moving schedule articles to draft                                                      
            this.createNotificationData.isScheduled = false;
            this.createNotificationData.version = 0.1;
            msg = "The request has been saved";
        } else if (buttonClick == "unpublish") {
            this.createNotificationData.status = "Draft";
            this.createNotificationData.isScheduled = false;
            this.createNotificationData.version = 0.1;
            this.createNotificationData.publishDate = '';
            this.createNotificationData.unpublishDate = new Date();
            this.createNotificationData.unpublishFlag = true;
            this.createNotificationData.publishNowToggle = false; //3 Dec - UAT fix on publish toggle issue
            msg = "The request has been saved";
        }
        console.log('BEFOREvideodatamethod');
        this.createNotificationData.playListId = "";
        console.log('handleCallbackToApex->', this.createNotificationData);
        createCustomPushNotification({ insertData: JSON.stringify(this.createNotificationData) })
            .then((result) => {
                console.log('result>>>>'+result);
                this.showSpinner = false;
                if (this.showpreview) {
                    this.showpreview = false;
                    this.notificationIdForPreview = result;
                    this.createNotificationData.notificationId = result;
                    this.openModal = true;
                    this.rootStore.getconnector().dispatch("showCustomNotificationDetailModal", { customNotificationId: this.createNotificationData.notificationId});
                    return;
                }

                if (
                    this.createNotificationData.actiontype === "create" ||
                    this.createNotificationData.actiontype === "clone"
                ) {
                    if (result) {
                        this.showErrorSuccessPopup(true, TP_CreateSucessMsg);
                        //this.updateBadgeCounter();
                    } else {
                        this.showErrorSuccessPopup(false, TP_CreateErrorMessage);
                    }
                }

                if (
                    this.createNotificationData.notificationId &&
                    this.createNotificationData.actiontype === "edit"
                ) {
                    if (result) {
                        if (buttonClick == "unpublish") {
                            this.showUnpublishinfoPopup(true, TP_unpublishSuccessMessage, true);
                        }
                        else {
                            this.showErrorSuccessPopup(true, TP_updateSuccessMessage);
                        }


                    } else {
                        this.showErrorSuccessPopup(false, TP_updateErrorMsg);
                    }
                }
                this.navigateToAdmin("customPushNotification", "Custom Push Notification");


            })
            .catch((error) => {
                this.showSpinner = false;
                console.error(error);
            });
        

        //clearInterval(this._interval);
    }

    updateBadgeCounter() {
        userArticleBadgeDetails({
            buName: this.user.buName
        })
            .then((result) => {
                this.userCatgryBadgeLst = [];
                for (let index = 0; index < result.length; index++) {
                    let obj = {};
                    if (result[index].badgeCount >= 100) {
                        obj.badgeCount = '99+';
                    } else {
                        obj.badgeCount = result[index].badgeCount;
                    }
                    obj.categoryName = result[index].categoryName;
                    obj.name = result[index].categoryName.replace(/[^A-Z0-9]+/gi, "");
                    this.userCatgryBadgeLst.push(obj);
                }
                this.rootStore
                    .getconnector()
                    .dispatch("badgeCounter", this.userCatgryBadgeLst);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    cancelNotification(event) {
        clearInterval(this._interval);
        if (this.createNotificationData.notificationId) {
            this.navigateToAdmin("customPushNotification", "Custom Push Notification");
        } else {
            this.navigateToAdmin(
                event.target.dataset.name,
                event.target.dataset.title
            );
        }
    }

    navigateToAdmin(name, title) {
        this.rootStore.getconnector().dispatch("navigate", {
            navitem: name,
            path: "/" + name,
            history: true,
            title: title
        });
    }

    //get drop Down Value
    getDropDownValue(event) {
        /*if (event.detail.filterfield == "Category") {
          this.createNotificationData.category = event.detail.selectedoption;
        }*/
        if (event.detail.filterfield == "Audience") {
            this.createNotificationData.audience = event.detail.selectedoption;
        }
        if (event.detail.filterfield == "contentGroup") {
            this.createNotificationData.contentGroupValue = event.detail.selectedoption;
        }
    }

    handlePublishToggel() {
        let userlocal = this.currentUserLocalTime();
        this.publishFlag = true;
        this.createNotificationData.publishDate = new Date(userlocal);
        //this.createNotificationData.archiveDate = new Date(userlocal);
        //this.createNotificationData.archiveDate.setDate(this.createNotificationData.archiveDate.getDate() + parseInt(archivedays));
        this.createNotificationData.publishDate = JSON.stringify(this.createNotificationData.publishDate);
        //this.createNotificationData.archiveDate = JSON.stringify(this.createNotificationData.archiveDate);
        this.createNotificationData.publishDate = this.createNotificationData.publishDate.substring(1,11);
        //this.createNotificationData.archiveDate = this.createNotificationData.archiveDate.substring(1,11);
    }

    /*
    handlePushNotificationToggel() {
        this.createNotificationData.pushNotificationFlag = !this.createNotificationData.pushNotificationFlag;
    }
    */

    //Allow comments toggle
    /*handlecommentsToggel(){
  
      this.createNotificationData.allowCommentsFlag = !this.createNotificationData.allowCommentsFlag;
  
    }*/

    clearCalender() {
        this.template.querySelector(`[data-id="startDate"]`).handleRefresh();
        this.template.querySelector(`[data-id="endDate"]`).handleRefresh();
        this.template.querySelector(`[data-id="startTime"]`).handleRefresh();
        this.template.querySelector(`[data-id="endTime"]`).handleRefresh();
        this.template.querySelector(`[data-id="calenderTitle"]`).value = "";
        this.template.querySelector(`[data-id="calenderDescription"]`).value = "";
        //this.createNotificationData.eventTitle = "";
        //this.createNotificationData.eventDescription = "";
        //this.createNotificationData.calendarStartDate = null;
        //this.createNotificationData.calendarEndDate = null;
        //this.createNotificationData.calendarStartTime = "06:00:00";
        //this.createNotificationData.calendarEndTime = "06:00:00";
    }

    //Calendar event date
    /*handleStartDate(event) {
      this.createNotificationData.calendarStartDate = event.detail;
    }
    handleEndDate(event) {
      this.createNotificationData.calendarEndDate = event.detail;
    }*/

    //publish
    handlePublishDate(event) {
        this.createNotificationData.publishDate = event.detail;
        //console.log('date->',date.now());

        console.log('this.createNotificationData.publishDate->', this.createNotificationData.publishDate);
        this.updateArchiveDate(this.createNotificationData.publishDate);
    }

    //update Archive Date on Publish Date change
    updateArchiveDate(date) {
        let publishDate = new Date(date);
        publishDate.setDate(publishDate.getDate() + parseInt(archivedays));
        //this.createNotificationData.archiveDate = JSON.stringify(publishDate).substring(1,11);
        /*
        if (
            this.createNotificationData.archiveDate &&
            this.template.querySelector(`[data-id="archiveDate"]`)
        ) {
            this.template
                .querySelector(`[data-id="archiveDate"]`)
                .rshhAfterDtSet(this.createNotificationData.archiveDate);
        }
        */
    }

    //publish
    /*handleArchiveDate(event) {
        this.createNotificationData.archiveDate = event.detail;
    }
    handleEvtStartTime(event) {
      this.createNotificationData.calendarStartTime = event.detail;
    }
    handleEvtEndTime(event) {
      this.createNotificationData.calendarEndTime = event.detail;
    }*/
    handlePublishTime(event) {
        this.createNotificationData.publishTime = event.detail;
    }
    /*
    handleArchiveTime(event) {
        this.createNotificationData.archiveTime = event.detail;
    }
    alterVideoBrowserModal(event) {
      this.videoBrowse = !this.videoBrowse;
    }*/

    //open and close attachment browser
    /*alterVideoBrowserModalDoc() {
      if (this.folderName) {
        this.docBrowse = !this.docBrowse;
      } else {
        this.showErrorSuccessPopup(false, noBuSelected);
      }
    }*/

    //open and close thumbnail image browser
    uploadTumbnailImage() {
        this.openmodal = !this.openmodal;
        if (!this.createNotificationData.thumbnailName) {
            this.SelectedScr = "";
        }
        this.isInvalidFile = false;
        let newRec = [];
        for (let rec of this.thumbnailimages) {
            let temp;
            temp = {
                thumbURL: rec.thumbURL,
                thumName: rec.thumName,
                thumbType: rec.thumbType,
                thumbVersion: rec.thumbVersion,
                thumbversionid: rec.thumbversionid,
                Id: rec.Id,
                isSelected: false
            };
            newRec.push(temp);
        }
        this.thumbnailimages = newRec;
        this.filteredThumbnailToDisplay = newRec;
        //this.filteredThumbnailToDisplay= this.thumbnailimages;
    }


    //Method to get user profile picture data from html
    updatedThumbnailPicture(event) {
        if (event.target.files.length > 0) {
            this.isInvalidFile = false;
            let file = event.target.files[0];
            if (file.size > this.MAX_FILE_SIZE || !file.type.includes("image")) {
                this.isInvalidFile = true;
                //this.showErrorSuccessPopup(false, TP_thumbnailSizeErrorMessage);
            } else {
                this.isInvalidFile = false;
                let reader = new FileReader();
                reader.onloadend = (e) => {
                    this.SelectedScr = e.target.result;
                    let newRec = [];
                    for (let rec of this.thumbnailimages) {
                        let temp;
                        temp = {
                            thumbURL: rec.thumbURL,
                            thumName: rec.thumName,
                            thumbType: rec.thumbType,
                            thumbVersion: rec.thumbVersion,
                            thumbversionid: rec.thumbversionid,
                            Id: rec.Id,
                            isSelected: false
                        };
                        newRec.push(temp);
                    }
                    this.thumbnailimages = newRec;

                    this.filteredThumbnailToDisplay = newRec;
                    let base64 = "base64,";
                    let content = reader.result.indexOf(base64) + base64.length;
                    let fileContents = reader.result.substring(content);
                    this.thumbnailFilesUploaded.thumbnailType = file.type;
                    this.thumbnailFilesUploaded.thumbnailName = file.name;
                    this.thumbnailFilesUploaded.thumbnailVersionData = fileContents;
                };
                reader.readAsDataURL(file);
            }
        }
    }

    saveProfilePicture(event) {
        if (!this.thumbnailFilesUploaded.thumbnailName) {
            this.showErrorSuccessPopup(false, TP_thumbnailInsertErrorMessage);
            return;
        } else {
            this.createNotificationData.thumbnailActionType = this.hasThumbnail
                ? "edit"
                : "create";
            this.createNotificationData.thumbnailName = this.thumbnailFilesUploaded.thumbnailName;
            this.createNotificationData.thumbnailType = this.thumbnailFilesUploaded.thumbnailType;
            this.createNotificationData.thumbnailVersionData = this.thumbnailFilesUploaded.thumbnailVersionData;
            this.createNotificationData.thumbnailImageId = this.thumbnailFilesUploaded.thumbnailImageId;
            this.showthumbnailClose = true;
        }
        this.uploadTumbnailImage();
    }

    //removing Thumbnail Piles
    handleThumbnailPiles() {
        this.SelectedScr = "";
        this.createNotificationData.thumbnailName = "";
        this.thumbnailFilesUploaded.thumbnailName = "";
        this.isInvalidFile = false;
        this.createNotificationData.thumbnailType = "";
        this.createNotificationData.thumbnailVersionData = "";
        this.showthumbnailClose = false;
        this.createNotificationData.thumbnailActionType = "create";
        /*
        if (this.ThumbnailToggle && this.template.querySelector(`[data-id="changeThumbnailToggle"]`)) {
            this.template.querySelector(`[data-id="changeThumbnailToggle"]`).click();
        }
        */
        let newRec = [];
        for (let rec of this.thumbnailimages) {
            let temp;
            temp = {
                thumbURL: rec.thumbURL,
                thumName: rec.thumName,
                thumbType: rec.thumbType,
                thumbVersion: rec.thumbVersion,
                thumbversionid: rec.thumbversionid,
                Id: rec.Id,
                isSelected: false
            };

            newRec.push(temp);
        }
        this.thumbnailimages = newRec;

        this.filteredThumbnailToDisplay = newRec;
    }

    // Open gallery for thumbnail image
    openGallery(event) {
        this.template.querySelector(`[data-id="picture"]`).click();
    }

    //open and close slideShow brower
    /*alertSlideshowBrowser() {
      if (this.folderName) {
        this.slideshowBrowse   = !this.slideshowBrowse;
      } else {
        this.showErrorSuccessPopup(false, noBuSelected);
      }
    }*/

    //handling data for attachment
    /*handleDatauploadModal(event) {
      if (
        event.detail &&
        event.detail.from &&
        event.detail.from == "brightcove"
      ) {
        this.videoData = this.copyListToAnother(
          this.videoData,
          event.detail.data
        );
        if (event.detail.data && event.detail.isUploaded) {
          this.videoDataUploaded = this.copyListToAnother(
            this.videoDataUploaded,
            event.detail.data
          );
        }
      }
      //Amazon S3
      else if (
        event.detail &&
        event.detail.data &&
        event.detail.data.length > 0
      ) {
        if (this.documentImageAudio.length + event.detail.data.length > 10) {
          this.showErrorSuccessPopup(
            false,
            "Can not add more than 10 Attachments"
          );
        } else {
          console.log('documentImageAudio',JSON.stringify(this.documentImageAudio));
          console.log('event.detail.data',JSON.stringify(event.detail.data));
          this.documentImageAudio = this.copyListToAnother(
            this.documentImageAudio,
            event.detail.data
          );
          console.log('documentImageAudio 2',JSON.stringify(this.documentImageAudio));
        }
  
        if (event.detail.isUploaded) {
          this.fileUploadedS3 = this.copyListToAnother(
            this.fileUploadedS3,
            event.detail.data
          );
        }
      }
    }*/

    //handling data for slideshow
    /*handleslideShowData(event) {
      if (event.detail && event.detail.data && event.detail.data.length > 0) {
        this.slideShowData = event.detail.data;
        if (event.detail.isUploaded) {
          this.fileUploadedS3 = this.copyListToAnother(
            this.fileUploadedS3,
            event.detail.data
          );
        }
      }
    }*/

    //putting tinymce file data on article
    handleTinyFileUploaded(event) {
        this.fileUploadedS3 = this.copyListToAnother(
            this.fileUploadedS3,
            event.detail.data
        );
    }

    //combining two lsit
    copyListToAnother(lst1, lst2) {
        for (let i = 0; i < lst2.length; i++) {
            lst1.push(lst2[i]);
        }
        for (let i = 0; i < lst1.length; i++) {
            lst1[i].ind = i;
        }
        return lst1;
    }

    //removing Attachment Piles
    /*handleAttachPiles(event) {
      this.documentImageAudio = this.removeFromList(
        this.documentImageAudio,
        event.currentTarget.dataset.id
      );
    }*/

    //removing slideshow Piles
    /*handleSlideshowPiles(event) {
      this.slideShowData = this.removeFromList(
        this.slideShowData,
        event.currentTarget.dataset.id
      );
    }*/

    /*handleVideoPiles(event) {
      this.videoData = this.removeFromList(
        this.videoData,
        event.currentTarget.dataset.id
      );
    }*/

    //removing one element from list
    removeFromList(lst, ind) {
        let filteredlst = [];
        for (let i = 0; i < lst.length; i++) {
            if (lst[i].ind != ind) {
                filteredlst.push(lst[i]);
            }
        }
        return filteredlst;
    }

    //functionality on Preview button
    onPreviewNotification(event) {
        this.showpreview = true;
        this.handleCallbackToApex(event);
        //clearInterval(this._interval);
    }

    //close the Modal
    closeModal() {
        this.openModal = false;
    }

    //for closing modal outside
    checkOpacityClick(event) {
        if (event.target == this.modalObject) {
            this.closeModal();
        }
    }

    handleThumbnailToggle(event) {
        this.ThumbnailToggle = !this.ThumbnailToggle;
    }


    handlePublishNowToggle(event) {
        console.log('this.createNotificationData.publishDate->', this.createNotificationData.publishDate);
        this.publishLaterFlag = !this.publishLaterFlag;
        //Publish Date issue 
        /* if(this.publishLaterFlag){
           this.createNotificationData.publishDate = "";
         }*/
    }
    getPublishTimeValue(event) {
        this.createNotificationData.publishTime = event.detail.selectedoption;
    }
    /*getArchiveTimeValue(event) {
        this.createNotificationData.calendarStartTime = event.detail.selectedoption;
    }
    handleContactNameChange(event) {
  
      if(this.template.querySelector(`[data-id="contactDropDown"]`)) {
        this.template.querySelector(`[data-id="contactDropDown"]`).handleInputChange(event.target.value);
      } 
      
    }*/
    /*handleContactData(event) {
      let childData = event.detail;
      if(childData.name && childData.name.length > 0) {
        this.addDataToListWithInd(this.contactData.name, childData.name);
        if (this.template.querySelector(`[data-id="contactName"]`)) {
          this.template.querySelector(`[data-id="contactName"]`).value = '';
        }
      }
  
      if(childData.email  && childData.email.length > 0) {
        this.addDataToListWithInd(this.contactData.email , childData.email );
      }
  
      if(childData.website && childData.website.length > 0) {
        this.addDataToListWithInd(this.contactData.website, childData.website);
      }
  
      if(childData.phone && childData.phone.length > 0) {
        this.addDataToListWithInd(this.contactData.phone, childData.phone);
      }
    }*/

    addDataToListWithInd(lst, newDataLst) {

        for (let i = 0; i < newDataLst.length; i++) {
            lst.push({
                value: newDataLst[i],
                ind: lst.length + i
            });
        }
    }

    /*removeContactData(event) {
  
        if(event.currentTarget.dataset.id == "contactNameVal") {
          this.handleremoveContactData(this.contactData.name, event.currentTarget.dataset.ind);
        }
  
        if(event.currentTarget.dataset.id == "contactEmailVal") {
          this.handleremoveContactData(this.contactData.email, event.currentTarget.dataset.ind);
        }
  
        if(event.currentTarget.dataset.id == "contactWebsiteVal") {
          this.handleremoveContactData(this.contactData.website , event.currentTarget.dataset.ind);
        }
  
        if(event.currentTarget.dataset.id == "contactPhoneVal") {
          this.handleremoveContactData(this.contactData.phone , event.currentTarget.dataset.ind);
        }
    }
  
    handleremoveContactData(lst, ind) {
      lst.splice(ind,1);
      for(let i = 0; i < lst.length; i++) {
        lst[i].ind = i;
      }
    }*/

    getcontactValue(lst) {
        let str = "";
        let tempLst = [];
        for (let i = 0; i < lst.length; i++) {
            tempLst.push(lst[i].value);
        }
        str = tempLst.join(';');
        return str;
    }
    /*handleAddContact(event) {
      let tempVale = ';'
  
      //for Name
      if(event.currentTarget.dataset.id == "contactNameAdd") {
        if (this.template.querySelector(`[data-id="contactName"]`)) {
          tempVale =  this.template.querySelector(`[data-id="contactName"]`).value;
          if(tempVale) {
            this.addDataToListWithInd(this.contactData.name, tempVale.split(';') );
          }
          this.template.querySelector(`[data-id="contactName"]`).value = '';
        }
      }
  
      //for Email
      if(event.currentTarget.dataset.id == "contactEmailAdd") {
        if (this.template.querySelector(`[data-id="contactEmail"]`)) {
          tempVale = this.template.querySelector(`[data-id="contactEmail"]`).value;
          if(tempVale) {
            this.addDataToListWithInd(this.contactData.email , tempVale.split(';') );
          }
          this.template.querySelector(`[data-id="contactEmail"]`).value = '';
        }
      }
  
      //for Website
      if(event.currentTarget.dataset.id == "contactWebsiteAdd") {
        if (this.template.querySelector(`[data-id="contactWebsite"]`)) {
          tempVale = this.template.querySelector(`[data-id="contactWebsite"]`).value;
          if(tempVale) {
            this.addDataToListWithInd(this.contactData.website , tempVale.split(';') );
          }
          this.template.querySelector(`[data-id="contactWebsite"]`).value = '';
        }
      }
  
      //for Phone
      if(event.currentTarget.dataset.id == "contactPhoneAdd") {
        if (this.template.querySelector(`[data-id="contactPhone"]`)) {
          tempVale = this.template.querySelector(`[data-id="contactPhone"]`).value;
          if(tempVale) {
            this.addDataToListWithInd(this.contactData.phone , tempVale.split(';') );
          }
          this.template.querySelector(`[data-id="contactPhone"]`).value = '';
        }
      }
    }*/


    //Updated for Touchpoint Phase 2 – Auto Save 
    startTimer() {

        this.timeoutId = window.setTimeout(this.autoSaveCreateArticle.bind(this), 0);

    }

    setupTimers() {
        if (this.createNotificationData.contentGroupValue != "None") {
            this.startTimer();
        }
    }

    autoRendering() {
        if (this.createNotificationData.contentGroupValue != "None") {
            var startTime = new Date().getTime();
            this._interval = setInterval(() => {
                if (new Date().getTime() - startTime > TP_AutoSaveExitTime) {
                    clearInterval(this._interval);
                    return;
                }
                else {
                    this.setupTimers();
                }
            }, TP_autoSaveTime);
        }

    }

    @track isAutoDisable = false;

    //Function call for Auto Save feature
    autoSaveCreateArticle() {
        this.autoSaveFlag = true;
        this.isAutoDisable = true;
        var buttonClick = 'saveAsDraft';
        this.buttonClickValue = buttonClick;
        //alert('auto active');
        //getting all input value
        this.getAllValue();
        var msg;
        let userlocal = this.currentUserLocalTime();
        this.createNotificationData.notificationBody = this.notificationBody;
        this.createNotificationData.publishFlag = true;
        this.createNotificationData.isScheduled = true;

        if (!this.createNotificationData.notificationId) {
            this.createNotificationData.status = "Draft";
        }
        else {
            this.createNotificationData.status = this.createNotificationData.currentStatus ? this.createNotificationData.currentStatus : "Draft";
            this.createNotificationData.actiontype == "clone";
        }

        if (this.createNotificationData.actiontype == "clone") {
            this.createNotificationData.status = "Draft";
        }

        if (this.createNotificationData.creatorName) {
            this.createNotificationData.creatorName = this.createNotificationData.creatorName.trim();
        }

        if (this.createNotificationData.audience == "None") {
            this.createNotificationData.audience = "";
        }

        /*if(this.createNotificationData.category=="None"){
          this.createNotificationData.category="";
        }*/
        this.createNotificationData.isScheduled = false;
        this.createNotificationData.version = 0.1;
        msg = "The request has been saved";

        
        /*if(this.createNotificationData.category=="None"){
            this.createNotificationData.category="";
        }*/
        if (this.createNotificationData.audience == "None") {
            this.createNotificationData.audience = "";
        }

        this.createNotificationData.playListId = "";
        this.createNotificationData.feature = "Auto Save";

        if (JSON.stringify(this.createNotificationData) !== JSON.stringify(this.createNotificationDataPre) && this.createNotificationData.contentGroupValue != "None") {
            createCustomPushNotification({ insertData: JSON.stringify(this.createNotificationData) })
                .then((result) => {
                    console.log('Res-->', result);

                    if (result != Error && result != 'Error') {
                        this.createNotificationData.notificationId = result;
                    }

                    if (
                        this.createNotificationData.actiontype === "create" ||
                        this.createNotificationData.actiontype === "clone"
                    ) {
                        if (result) {
                            this.showErrorinfoPopup(true, TP_AutoSaveSucessMsg, true);
                            //this.updateBadgeCounter();
                        } else {
                            this.showErrorSuccessPopup(false, TP_AutoSaveErrorMsg);
                        }
                    }

                    if (
                        this.createNotificationData.notificationId &&
                        this.createNotificationData.actiontype === "edit"
                    ) {
                        if (result != Error && result != 'Error') {
                            this.showErrorinfoPopup(true, TP_AutoSaveSucessMsg, true);
                        } else {
                            this.showErrorSuccessPopup(false, TP_AutoSaveErrorMsg);
                        }
                    }
                    this.createNotificationDataPre = JSON.parse(JSON.stringify(this.createNotificationData));
                    this.isAutoDisable = false;
                })
                .catch((error) => {
                    this.isAutoDisable = false;
                    console.error(error);
                });
        }
        else {
            this.isAutoDisable = false;
        }
        

    }

    /*
    initiateAutoSave() {
        if (this.createNotificationData.contentGroupValue != "None" && this.createNotificationData.actiontype !== "edit" && this.counter_AutoSave == 0 && this.autoSaveEnableCheck == 'Yes') {
            this.autoRendering();
            this.showErrorinfoPopup(true, TP_AutoSaveInitiateMsg, true);
            this.counter_AutoSave = this.counter_AutoSave + 1;
        }
    }
    */

    disconnectedCallback() {
        clearInterval(this._interval);
    }
    //Ends here

    //TP - Phase 2 - Unpublish req
    @track showConfirmation = false;
    @track confirmationMessage = '';

    handleUnpublish() {
        this.showConfirmation = true;
        this.confirmationMessage = Tp_UnpublishArticleMsg;
    }

    unpublishFlag = false;
    handleMove(event) {
        try {
            if (event.detail === "true") {
                this.showConfirmation = false;
                this.unpublishFlag = true;
                this.handleCallbackToApex();
            } else if (event.detail === "false") {
                this.showConfirmation = false;
            }
        } catch (error) {
            console.log('Error:' + error);
        }
    }

    handleCancel(event) {
        this.showConfirmation = false;

    }
    
    get remainingBodyLength(){
        return 200 - (this.notificationBody ? this.notificationBody.replace( /(<([^>]+)>)/ig, '').trim() : '').length;
    }

    handleArticleBody(event){
        //console.log(event.target.value);
        const bodyWithoutHTMLLength = (event.target.value ? event.target.value.replace( /(<([^>]+)>)/ig, '').trim() : '').length;
        if(bodyWithoutHTMLLength > 200){
            event.target.value = this.notificationBody;
        }else{
            this.notificationBody = event.target.value;
        }
        //this.remainingBodyLength = 200 - (this.notificationBody ? this.notificationBody.replace( /(<([^>]+)>)/ig, '').trim() : '').length;
        //new lwx("_rootstore").getconnector().dispatch("notificationBody", event.target.value);
    }

    //Ends here 


    @track openAIModal = false;
    @track isDisplayNoAI = false;
    @track AiAssistanceVerbiage;
    @track enableOpenAI = false;
    @track promptMsg ;

    sendTextToOpenAi() {
        this.showSpinner = true;
        console.log('sendTextToOpenAi>>>>');
        let openaitextarea = this.template.querySelector(".openaitextarea");
        console.log('openaitextarea>>>>'+openaitextarea);
        let openaitextareavalue = openaitextarea.value;
        this.promptMsg = openaitextareavalue;
        console.log('openaitextareavalue>>>>'+openaitextareavalue);
        let result = '';
        this.AiAssistanceVerbiage = result; 

        //this.handleMsgBody(result);

        if(this.enableOpenAI){
            openAICall({
                text: openaitextareavalue
            })
            .then(result => {
                this.showSpinner = false;
                this.AiAssistanceVerbiage = result;
                //this.handleMsgBody(result);
            })
            .catch(error => {
                console.error(error);
                this.showSpinner = false;
                const event = new ShowToastEvent({
                    title: 'error!',
                    message: error,
                    variant: 'error',
                    mode: 'dismissable'
                });
                this.dispatchEvent(event);
            })
        }else{
            this.showSpinner = false;
            result = 'test dummy message to avoid hit to api';
        }

        this.openAIModal = true;
    }

    handleCloseAIAssit(){
        this.openAIModal = false;
        this.promptMsg = '';
    }

    @track enableGeolocation = false;
    handlePopupDisclaimer(event){
        this.enableGeolocation = event.target.checked;
        this.createNotificationData.geoTarget = event.target.checked;
        if(this.enableGeolocation){
            this.getStateOptions();
        }else{
            this.allStateData.allState = [];
            this.allCityData.allCity = [];
            this.allStateData.selectedValue = [];
            this.allCityData.selectedValue = [];
            this.allRegionData.selectedValue = [];
            this.createNotificationData.stateValue="";
            this.createNotificationData.cityValue="";
            this.createNotificationData.regionValue = "";
            this.hideStateAndCity = false;
            this.hideRegion = false;
        }

        console.log('this.allDualListValue.slectedStateValue>>>>'+this.allDualListValue.slectedStateValue);
        console.log('this.allDualListValue.slectedStateValue>>>>'+this.allStateData.selectedValue);
        
    }

    @track statoptions;
    @track repRosterStateCityResult;
    getRepRoasterWithSalesforcecode(SalesforceCd){
        repRoasterDetails({
            salesforceCodes: SalesforceCd
        })
        .then(result => {
            var repRoasterRecords = result;
            if(result){
                this.repRosterStateCityResult = result;
                var stateList = [];
                let stateSet = new Set();                    
                result.forEach(function (rec) {                        
                    if (rec.Territory_State_abv__c) {
                        stateSet.add(rec.Territory_State_abv__c);
                    }                  
                });
                stateSet.forEach(function (rec) {                        
                    stateList.push({key:rec,value:rec});
                });
                //this.statoptions = stateList.sort();
                this.allStateData.allState = stateList.sort();
                //this.setCityOnEdit();
                //this.enableGeolocation = false;
                //this.enableGeolocation = true;
                if (this.template.querySelector(`[data-id="State"]`)) {
                    this.template.querySelector(`[data-id="State"]`).handleRefresh();
                }
            }          
        })
        .catch(error => {
            console.error('RepRoaster error: ', error);
        });
    }

    getRegioOptions(){
        this.showSpinner = true;
        getRegions({})
        .then(result => {
            if(result){
                var regionList = [];
                let regionSet = new Set();                    
                result.forEach(function (rec) {                        
                    regionSet.add(rec);                       
                });
                regionSet.forEach(function (rec) {                        
                    regionList.push({key:rec,value:rec})
                });
                this.allRegionData.allRegion = regionList;
                this.showSpinner = false;
                if (this.template.querySelector(`[data-id="Region"]`)) {
                  this.template.querySelector(`[data-id="Region"]`).handleRefresh();
                }
            }                
        })
        .catch(error => {
            this.showSpinner = false;
            console.error('getRegioOptions error: ', error);                
        });
      }

    getStateOptions(){
        this.showSpinner = true;
        getStates({})
        .then(result => {
            if(result){
                //this.repRosterStateCityResult = result;
                var stateList = [];
                let stateSet = new Set();                    
                result.forEach(function (rec) {                        
                    stateSet.add(rec);                       
                });
                stateSet.forEach(function (rec) {                        
                    stateList.push({key:rec,value:rec})
                });
                this.allStateData.allState = stateList;
                this.showSpinner = false;
                //this.setCityOnEdit();
                if (this.template.querySelector(`[data-id="State"]`)) {
                  this.template.querySelector(`[data-id="State"]`).handleRefresh();
                }
            }                
        })
        .catch(error => {
            this.showSpinner = false;
            console.error('getStateOptions error: ', error);                
        });
    }

    /*getCityOptions(reprosterDetal,selstate){
        if(reprosterDetal){
            console.log('getCityOptions>1>>'+this.enableGeolocation);
            let citySet = new Set();      
            let cityList = []; 
            reprosterDetal.forEach(function (rec) {                        
                if (rec.Territory_City_abv__c && selstate.includes(rec.Territory_State_abv__c)) {
                    citySet.add(rec.Territory_City_abv__c);
                }                    
            });
            citySet.forEach(function (rec) {                        
                cityList.push({key:rec,value:rec})
            });
            this.allCityData.allCity = cityList.sort();
            if (this.template.querySelector(`[data-id="City"]`)) {
                this.template.querySelector(`[data-id="City"]`).handleRefresh();
            }
            //this.enableGeolocation = true;
            console.log('getCityOptions>>2>'+this.enableGeolocation);
            this.getZipOptions(this.allDualListValue.slectedStateValue,this.allDualListValue.slectedCityValue);
        }
    }*/
    
    /*getCityOptions(reprosterDetal,selstate){
        if(selstate){
            cityDetailsRepRoaster({
                salesforceCodes: this.allDualListValue.slectedProductTeam,
                selStateList: selstate
            })
            .then(result => {
                //console.log('result>>>>'+result);
                if(result){            
                    this.allCityData.allCity = result;  
                    if (this.template.querySelector(`[data-id="City"]`)) {
                    this.template.querySelector(`[data-id="City"]`).handleRefresh();
                    }
                    this.getZipOptions(this.allDualListValue.slectedStateValue,this.allDualListValue.slectedCityValue);
                }          
            })
            .catch(error => {
                console.error('RepRoaster error: ', error);
            });
        }    
    }*/

    getCityOptions(selstate){
        this.showSpinner = true;
        if(selstate != '' && selstate){
            getCities({
                states: selstate
            })
            .then(result => {
                var cityList = [];
                if(result){                        
                    let citySet = new Set();                    
                    result.forEach(function (rec) {                        
                        if (rec) {
                            citySet.add(rec);
                        }                        
                    });
                    citySet.forEach(function (rec) {                        
                        cityList.push({ key:rec,value:rec })
                    });                       
                }
                this.allCityData.allCity = cityList;
                if (this.template.querySelector(`[data-id="City"]`)) {
                  this.template.querySelector(`[data-id="City"]`).handleRefresh();
                }
                this.showSpinner = false;        
            })
            .catch(error => {
                this.showSpinner = false;
                console.error('getCityOptions error: ', error);                
            }); 
        }
        this.showSpinner = false;     
    }

    /*getZipOptions(selState,selCity){
        cityToZipDetails({
            stateList: selState,
            cityList: selCity
        })
        .then(result => {
            var repRoasterRecords = result;
            let finalZipList = [];
            if(result){
                this.allZipData.allZip = result;
                //this.enableGeolocation = true;
            }
            //this.allZipData.allZip = finalZipList.sort(); 
            if (this.template.querySelector(`[data-id="Zip"]`)) {
            this.template.querySelector(`[data-id="Zip"]`).handleRefresh();
            }
            this.showSpinner = false;
        })
        .catch(error => {
            console.error('RepRoaster error: ', error);
            this.showSpinner = false;
        });
    }*/

    @track hideStateAndCity = false;
    getSelectedRegion(event) {
      this.showSpinner = true;
      this.allDualListValue.slectedRegionValue = event.detail ? event.detail : [];    
      if (this.allDualListValue.slectedRegionValue && this.allDualListValue.slectedRegionValue.length > 0) {
        //this.getStateOptionsWithRegion(this.allDualListValue.slectedRegionValue);
        this.hideStateAndCity = true;
        this.showSpinner = false;
      } else {
        this.showSpinner = false;
        this.allCityData.allCity = [];
        this.allZipData.allZip = []; 
        this.hideStateAndCity = false;
        if (this.template.querySelector(`[data-id="City"]`)) {
          this.template.querySelector(`[data-id="City"]`).handleRefresh();
        }
        if (this.template.querySelector(`[data-id="Zip"]`)) {
          this.template.querySelector(`[data-id="Zip"]`).handleRefresh();
        }     
      }
      
    }

    @track hideRegion = false;
    getSelectedState(event) {
        //this.showSpinner = true;
        this.allDualListValue.slectedStateValue = event.detail ? event.detail : [];        
        //this.getCityOptions(this.repRosterStateCityResult,this.allDualListValue.slectedStateValue);
        if (this.allDualListValue.slectedStateValue && this.allDualListValue.slectedStateValue.length > 0) {
            this.getCityOptions(this.allDualListValue.slectedStateValue);
            this.hideRegion = true;
        } else {
            this.allCityData.allCity = [];
            this.allZipData.allZip = [];  
            this.hideRegion = false;    
        }
        if (this.template.querySelector(`[data-id="City"]`)) {
          this.template.querySelector(`[data-id="City"]`).handleRefresh();
        }
        if (this.template.querySelector(`[data-id="Zip"]`)) {
          this.template.querySelector(`[data-id="Zip"]`).handleRefresh();
        }
    }
    
    getSelectedCity(event) {
        this.allDualListValue.slectedCityValue = event.detail ? event.detail : [];
        //let reprosterDetal = this.repRosterStateCityResult;
        //this.enableGeolocation = false;
        //this.getZipOptions(this.allDualListValue.slectedStateValue,this.allDualListValue.slectedCityValue);    
    }
    
    getSelectedZip(event) {
        this.allDualListValue.slectedZipValue = event.detail ? event.detail : [];
        /*if (this.template.querySelector(`[data-id="Zip"]`)) {
          this.template.querySelector(`[data-id="Zip"]`).handleRefresh();
        }*/
    }

    getSelFranchiseRegions(selectedFranchise, selectedBusValue){
        getFranchiseRegions({
          selFranchise : selectedFranchise,
          selDivision : selectedBusValue
        })
         .then((result) => {
                var regionList = [];
                let regionSet = new Set();                    
                result.forEach(function (rec) {                        
                    regionSet.add(rec);                       
                });
                regionSet.forEach(function (rec) {                        
                    regionList.push({key:rec,value:rec})
                });
          this.allRegionData.allRegion = regionList;
          if (this.template.querySelector(`[data-id="Region"]`)) {
            this.template.querySelector(`[data-id="Region"]`).handleRefresh();
          }
          })
          .catch((error) => {
            console.error(error);
          });
      }

      @track enableNeedAIAssistance = false;
      handleNeedAICheckBox(event){
        this.enableNeedAIAssistance = event.target.checked;
        //this.createArticleData.geoTarget = event.target.checked;
      }
}